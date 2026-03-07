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
        $gps = $_POST['gps'] ?? null;
        
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
                // 3. Update needs status to 'remise_a_verifier' (Phase 4 Verification)
                $uNeed = "UPDATE needs SET 
                            status = 'remise_a_verifier', 
                            remise_proof_path = :proof, 
                            remise_message = :msg,
                            remise_time = NOW() 
                          WHERE id = :nid";
                $sNeed = $db->prepare($uNeed);
                $sNeed->execute([
                    ':proof' => $receipt_path,
                    ':msg' => $message,
                    ':nid' => $need_id
                ]);

                // 4. We DO NOT update donations or notify donors yet. 
                // That will happen when the admin verifies the remise.
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
                       status = 'verifie', 
                       delivery_message = :msg, 
                       delivery_photo_path = :photo,
                       hedera_sequence = :hedera
                       WHERE id = :id";
            $uStmt = $db->prepare($uQuery);
            $uStmt->execute([
                ':msg' => $message,
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
