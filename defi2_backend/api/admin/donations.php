<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch pending verifications
    try {
        $query = "SELECT d.*, u.full_name as donor_name, n.type as need_type, n.district,
                         n.description, n.required_mru, n.collected_mru, n.beneficiaries 
                  FROM donations d
                  LEFT JOIN users u ON d.user_id = u.id
                  LEFT JOIN needs n ON d.need_id = n.id
                  WHERE d.status = 'en_attente'
                  ORDER BY d.created_at ASC";

        $stmt = $db->query($query);
        $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($donations);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching donations.", "error" => $e->getMessage()]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Validate or Reject a donation
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data || !isset($data->action) || !isset($data->donation_id)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing parameters (action, donation_id)."]);
        exit;
    }

    $id = $data->donation_id;
    $action = $data->action; // 'validate' or 'reject'
    $admin_note = $data->admin_note ?? '';
    $rejection_reason = $data->rejection_reason ?? null;

    try {
        // Start transaction
        $db->beginTransaction();

        $donationQuery = "SELECT need_id, user_id, amount, status FROM donations WHERE id = :id FOR UPDATE";
        $stmt0 = $db->prepare($donationQuery);
        $stmt0->execute([':id' => $id]);
        $donation = $stmt0->fetch(PDO::FETCH_ASSOC);

        if (!$donation) {
            throw new Exception("Donation not found.");
        }

        if ($action === 'validate') {
            // Fetch platform commission rate
            $comQ = "SELECT setting_value FROM platform_settings WHERE setting_key = 'commission_rate' LIMIT 1";
            $comStmt = $db->query($comQ);
            $comRow = $comStmt->fetch(PDO::FETCH_ASSOC);
            $commission_rate = $comRow ? (float)$comRow['setting_value'] : 0; // Default to 0% if missing

            $raw_amount = (float)$donation['amount'];
            $commission_amount = $raw_amount * ($commission_rate / 100);
            $net_amount = $raw_amount - $commission_amount;

            // Trigger Hedera anchoring via Microservice
            $hederaPayload = [
                "event" => "DONATION_VERIFIED",
                "donation_id" => (int)$id,
                "amount" => (float)$raw_amount,
                "need_id" => (int)$donation['need_id'],
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
                    $hedera_tx_id = $hData['transactionId']; // Hedera TX ID
                    $hedera_seq = $hData['sequenceNumber'] ?? null;
                }
            }
            if (!$hedera_tx_id) {
                 $hedera_tx_id = 'pending-hedera-' . time();
            }

            // Update donation status
            $query = "UPDATE donations SET status = 'verifie', admin_note = :note, hedera_tx_id = :htx, hedera_sequence = :hseq WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':note' => $admin_note, ':htx' => $hedera_tx_id, ':hseq' => $hedera_seq, ':id' => $id]);

            // Update need collected amount with the Net amount (after commission drop)
            $updateNeed = "UPDATE needs SET collected_mru = collected_mru + :net WHERE id = :need_id";
            $stmtN = $db->prepare($updateNeed);
            $stmtN->execute([':net' => $net_amount, ':need_id' => $donation['need_id']]);

            // Check if the need is now funded
            $check_query = "SELECT id, required_mru, collected_mru, type, status FROM needs WHERE id = :need_id FOR UPDATE";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->execute([':need_id' => $donation['need_id']]);
            $need = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if ($need && (float)$need['collected_mru'] >= (float)$need['required_mru'] && $need['status'] === 'ouvert') {
                // Change status to 'finance'
                $final_query = "UPDATE needs SET status = 'finance' WHERE id = :need_id";
                $db->prepare($final_query)->execute([':need_id' => $donation['need_id']]);

                // Notify Assigned Partner that the need is now funded
                $partner_query = "SELECT po.partner_id, p.user_id 
                                 FROM partner_orders po 
                                 JOIN partners p ON po.partner_id = p.id 
                                 WHERE po.need_id = :nid LIMIT 1";
                $pStmt = $db->prepare($partner_query);
                $pStmt->execute([':nid' => $donation['need_id']]);
                $partner = $pStmt->fetch(PDO::FETCH_ASSOC);

                if ($partner) {
                    $notif_query = "INSERT INTO notifications (user_id, title, message, type) 
                                   VALUES (:uuid, 'Besoin Financé !', 'Un besoin auquel vous êtes assigné est désormais entièrement financé. Vous pouvez commencer la préparation.', 'info')";
                    $db->prepare($notif_query)->execute([':uuid' => $partner['user_id']]);
                }
            }

            // Get Validator ID to notify them
            $qVal = "SELECT validator_id FROM needs WHERE id = :nid LIMIT 1";
            $sVal = $db->prepare($qVal);
            $sVal->execute([':nid' => $donation['need_id']]);
            $valNeeds = $sVal->fetch(PDO::FETCH_ASSOC);

            if ($valNeeds && $valNeeds['validator_id']) {
                $nQuery = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'info')";
                $nStmt = $db->prepare($nQuery);
                $nStmt->execute([
                    ':uid' => $valNeeds['validator_id'],
                    ':title' => "Don Vérifié ! Confirmez la remise.",
                    ':msg' => "Un don de {$donation['amount']} MRU a été vérifié pour votre besoin. Confirmez la remise."
                ]);
            }

            // Notify Donor
            if ($donation['user_id']) {
                $nQueryDonor = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'success')";
                $nStmtDonor = $db->prepare($nQueryDonor);
                $nStmtDonor->execute([
                    ':uid' => $donation['user_id'],
                    ':title' => "Merci ! Don Confirmé",
                    ':msg' => "Votre virement de {$donation['amount']} MRU a été validé par l'équipe IHSAN. Le don est en cours d'ancrage sur Hedera."
                ]);
            }

        } else if ($action === 'reject') {
            // Update donation status to "refuse"
            $query = "UPDATE donations SET status = 'refuse', admin_note = :note, rejection_reason = :reason WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':note' => $admin_note, ':reason' => $rejection_reason, ':id' => $id]);

            // Notify Donor
            if ($donation['user_id']) {
                $nQueryDonorR = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'error')";
                $nStmtDonorR = $db->prepare($nQueryDonorR);
                $nStmtDonorR->execute([
                    ':uid' => $donation['user_id'],
                    ':title' => "Problème avec votre reçu",
                    ':msg' => "Votre don de {$donation['amount']} MRU a été rejeté. Motif : $rejection_reason. Veuillez resoumettre votre reçu."
                ]);
            }
        } else {
            throw new Exception("Unknown action.");
        }

        $db->commit();
        echo json_encode(["message" => "Donation processed successfully."]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["message" => "Processing failed.", "error" => $e->getMessage()]);
    }
}
?>
