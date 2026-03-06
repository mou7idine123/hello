<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
$user = AuthMiddleware::checkRole(['validator']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $id = $_POST['donation_id'] ?? null;
        $type = $_POST['type'] ?? 'donation'; // 'donation' or 'order'
        $message = $_POST['message'] ?? '';
        $gps = $_POST['gps'] ?? '';
        
        if (!$id) {
            throw new Exception("ID is required.");
        }

        $db->beginTransaction();

        $hedera_seq = "0.0." . rand(1000000, 9999999);
        $receipt_path = null;

        // Handle Photo Upload (Phase 4 requirement: anonymized photo)
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
            $upload_dir = '../../uploads/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
            $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $filename = 'delivery_' . $id . '_' . time() . '.' . $ext;
            $target_file = $upload_dir . $filename;
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_file)) {
                $receipt_path = 'uploads/' . $filename;
            }
        }

        if ($type === 'order') {
            // 1. Update partner_orders to 'remis'
            $uOrder = "UPDATE partner_orders SET status = 'remis' WHERE id = :id";
            $sOrder = $db->prepare($uOrder);
            $sOrder->execute([':id' => $id]);

            // 2. Find need_id
            $qNeedId = "SELECT need_id FROM partner_orders WHERE id = :id";
            $sNeedId = $db->prepare($qNeedId);
            $sNeedId->execute([':id' => $id]);
            $need_id = $sNeedId->fetchColumn();

            if ($need_id) {
                // 3. Update needs status to 'complete' (Phase 4 Finalization)
                $uNeed = "UPDATE needs SET status = 'complete' WHERE id = :nid";
                $sNeed = $db->prepare($uNeed);
                $sNeed->execute([':nid' => $need_id]);

                // 4. Update all associated donations to 'complete'
                $uDonations = "UPDATE donations SET 
                               status = 'complete', 
                               delivery_message = :msg, 
                               gps_coordinates = :gps, 
                               delivery_photo_path = :photo,
                               hedera_sequence = :hedera
                               WHERE need_id = :nid";
                $sDonations = $db->prepare($uDonations);
                $sDonations->execute([
                    ':msg' => $message,
                    ':gps' => $gps,
                    ':photo' => $receipt_path,
                    ':hedera' => $hedera_seq,
                    ':nid' => $need_id
                ]);

                // 5. Notify all donors of this need
                $qDonors = "SELECT DISTINCT user_id FROM donations WHERE need_id = :nid";
                $sDonors = $db->prepare($qDonors);
                $sDonors->execute([':nid' => $need_id]);
                $donors = $sDonors->fetchAll(PDO::FETCH_ASSOC);

                foreach($donors as $donor) {
                    $nQuery = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'success')";
                    $nStmt = $db->prepare($nQuery);
                    $nStmt->execute([
                        ':uid' => $donor['user_id'],
                        ':title' => "Besoin Comblé !",
                        ':msg' => "Le besoin auquel vous avez contribué a été entièrement remis sur le terrain. La photo de preuve est disponible sur votre dashboard.",
                    ]);
                }
            }
        } else {
            // Legacy / Single Donation Logic
            $cQuery = "SELECT id, user_id, status FROM donations WHERE id = :id FOR UPDATE";
            $cStmt = $db->prepare($cQuery);
            $cStmt->execute([':id' => $id]);
            $donation = $cStmt->fetch(PDO::FETCH_ASSOC);

            // Accept both legacy 'Vérifié' and new statuses if applicable, but strictly enforce workflow for new ones
            if (!$donation) {
                throw new Exception("Donation not found.");
            }

            $uQuery = "UPDATE donations SET 
                       status = 'complete', 
                       delivery_message = :msg, 
                       gps_coordinates = :gps, 
                       delivery_photo_path = :photo,
                       hedera_sequence = :hedera
                       WHERE id = :id";
            $uStmt = $db->prepare($uQuery);
            $uStmt->execute([
                ':msg' => $message,
                ':gps' => $gps,
                ':photo' => $receipt_path,
                ':hedera' => $hedera_seq,
                ':id' => $id
            ]);

            // Notify single donor
            $nQuery = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'success')";
            $nStmt = $db->prepare($nQuery);
            $nStmt->execute([
                ':uid' => $donation['user_id'],
                ':title' => "Don Remis !",
                ':msg' => "Votre don a été officiellement remis sur le terrain. Merci !"
            ]);
        }

        // Common: Update Validator Reputation
        $rQuery = "UPDATE users SET reputation_score = reputation_score + 5 WHERE id = :user_id";
        $rStmt = $db->prepare($rQuery);
        $rStmt->execute([':user_id' => $user->id]);

        $db->commit();

        http_response_code(200);
        echo json_encode(["message" => "Delivery confirmed as complete.", "hedera_sequence" => $hedera_seq]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(400);
        echo json_encode(["message" => $e->getMessage()]);
    }
}
?>
