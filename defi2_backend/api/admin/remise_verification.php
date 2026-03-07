<?php
require_once __DIR__ . '/../../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
$user = AuthMiddleware::checkRole(['admin']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // List needs awaiting remise verification
    $query = "SELECT n.*, u.full_name as validator_name, p.business_name as partner_name
              FROM needs n
              JOIN users u ON n.validator_id = u.id
              LEFT JOIN partner_orders po ON n.id = po.need_id
              LEFT JOIN partners p ON po.partner_id = p.id
              WHERE n.status = 'remise_a_verifier'
              ORDER BY n.remise_time ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Verify or Reject Remise
    $data = json_decode(file_get_contents("php://input"));
    $need_id = $data->need_id ?? null;
    $action = $data->action ?? null; // 'approve' or 'reject'
    
    if (!$need_id || !$action) {
        http_response_code(400);
        echo json_encode(["message" => "Missing parameters."]);
        exit;
    }

    try {
        $db->beginTransaction();

        // Get need and order info for scoring
        $qInfo = "SELECT n.validator_id, n.type, n.remise_time, po.scheduled_time 
                  FROM needs n 
                  LEFT JOIN partner_orders po ON n.id = po.need_id 
                  WHERE n.id = :nid";
        $sInfo = $db->prepare($qInfo);
        $sInfo->execute([':nid' => $need_id]);
        $info = $sInfo->fetch(PDO::FETCH_ASSOC);

        if (!$info) throw new Exception("Need not found.");

        if ($action === 'approve') {
            // 1. Update Need status
            $uNeed = "UPDATE needs SET status = 'complete' WHERE id = :nid";
            $db->prepare($uNeed)->execute([':nid' => $need_id]);

            // 2. Points Addition: +10 for approved remise
            $uScore = "UPDATE users SET score = IFNULL(score, 20) + 10 WHERE id = :uid";
            $db->prepare($uScore)->execute([':uid' => $info['validator_id']]);

            // 3. Check for Delay Penalty (-2 if remise_time > scheduled_time + 24h)
            if ($info['remise_time'] && $info['scheduled_time']) {
                $remiseTs = strtotime($info['remise_time']);
                $schedTs = strtotime($info['scheduled_time']);
                if ($remiseTs > ($schedTs + 86400)) { // 86400s = 24h
                    $uPenalty = "UPDATE users SET score = score - 2 WHERE id = :uid";
                    $db->prepare($uPenalty)->execute([':uid' => $info['validator_id']]);
                }
            }

            // 4. Update Donations and Notify Donors
            $qDonations = "UPDATE donations SET status = 'verifie' WHERE need_id = :nid";
            $db->prepare($qDonations)->execute([':nid' => $need_id]);

            $qDonors = "SELECT DISTINCT user_id FROM donations WHERE need_id = :nid";
            $sDonors = $db->prepare($qDonors);
            $sDonors->execute([':nid' => $need_id]);
            $donors = $sDonors->fetchAll(PDO::FETCH_ASSOC);

            foreach($donors as $donor) {
                $nQuery = "INSERT INTO notifications (user_id, title, message, type) 
                           VALUES (:uid, 'Besoin Comblé !', 'Le besoin auquel vous avez contribué a été entièrement remis sur le terrain.', 'success')";
                $db->prepare($nQuery)->execute([':uid' => $donor['user_id']]);
            }
            
            // Notify Validator
            $nVal = "INSERT INTO notifications (user_id, title, message, type) 
                     VALUES (:uid, 'Preuve Validée', :msg, 'success')";
            $vMsg = "Votre preuve de remise pour le besoin \"" . $info['type'] . "\" a été validée par l'admin.";
            $db->prepare($nVal)->execute([':uid' => $info['validator_id'], ':msg' => $vMsg]);

            // Log Delivery to Hedera HCS
            $hederaPayload = [
                "event" => "DELIVERY_CONFIRMED",
                "need_id" => (int)$need_id,
                "validator_id" => (int)$info['validator_id'],
                "type" => $info['type'],
                "timestamp" => date('c')
            ];
            $options = [
                'http' => [
                    'header'  => "Content-type: application/json\r\nConnection: close\r\n",
                    'method'  => 'POST',
                    'content' => json_encode($hederaPayload),
                    'timeout' => 15 // Increased to 15s to wait for Hedera consensus
                ]
            ];
            $context  = stream_context_create($options);
            $hederaResult = @file_get_contents('http://localhost:3000/api/log-impact', false, $context);
            
            $hedera_tx_id = null;
            $hedera_seq = null;
            if ($hederaResult) {
                $hData = json_decode($hederaResult, true);
                if (isset($hData['success']) && $hData['success']) {
                    $hedera_tx_id = $hData['transactionId']; 
                    $hedera_seq = $hData['sequenceNumber'] ?? null;
                }
            }
            if (!$hedera_tx_id) {
                 $hedera_tx_id = 'pending-hedera-remise-' . time();
            }

            // Save the Hedera data to the needs table
            $uNeedHCS = "UPDATE needs SET hedera_tx_id = :htx, hedera_sequence = :hseq WHERE id = :nid";
            $db->prepare($uNeedHCS)->execute([':htx' => $hedera_tx_id, ':hseq' => $hedera_seq, ':nid' => $need_id]);

        } else {
            // Reject - Set back to 'en_cours'
            $uNeed = "UPDATE needs SET status = 'en_cours' WHERE id = :nid";
            $db->prepare($uNeed)->execute([':nid' => $need_id]);
            
            // Set partner order back to 'pret_pour_collecte' so it shows up
            $uOrder = "UPDATE partner_orders SET status = 'pret_pour_collecte' WHERE need_id = :nid";
            $db->prepare($uOrder)->execute([':nid' => $need_id]);

            // 2. Points Deduction: -5 for remise refused
            $uScore = "UPDATE users SET score = score - 5 WHERE id = :uid";
            $db->prepare($uScore)->execute([':uid' => $info['validator_id']]);

            // Notify Validator of Rejection
            $nVal = "INSERT INTO notifications (user_id, title, message, type) 
                     VALUES (:uid, 'Preuve Refusée', :msg, 'error')";
            $rejMsg = "Votre preuve de remise pour le besoin \"" . $info['type'] . "\" a été refusée. Veuillez fournir une meilleure image.";
            $db->prepare($nVal)->execute([':uid' => $info['validator_id'], ':msg' => $rejMsg]);
        }

        $db->commit();
        echo json_encode(["message" => "Action processed successfully."]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["message" => $e->getMessage()]);
    }
}
?>
