<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
        if (!isset($_POST['donation_id'])) {
            throw new Exception("donation_id is required.");
        }

        $donation_id = $_POST['donation_id'];
        $message = $_POST['message'] ?? '';
        $gps = $_POST['gps'] ?? '';
        
        $db->beginTransaction();

        // 1. Check if Donation is in "Vérifié" state 
        $cQuery = "SELECT id, user_id, status FROM donations WHERE id = :id FOR UPDATE";
        $cStmt = $db->prepare($cQuery);
        $cStmt->execute([':id' => $donation_id]);
        $donation = $cStmt->fetch(PDO::FETCH_ASSOC);

        if (!$donation || $donation['status'] !== 'Vérifié') {
            throw new Exception("Donation is not in a strictly verified state ready for delivery.");
        }

        // 2. Handle Photo Upload
        $receipt_path = null;
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
            $upload_dir = '../../uploads/';
            if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
            $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
            $filename = 'delivery_' . $donation_id . '_' . time() . '.' . $ext;
            $target_file = $upload_dir . $filename;
            if (move_uploaded_file($_FILES['photo']['tmp_name'], $target_file)) {
                $receipt_path = 'uploads/' . $filename;
            }
        }

        // 3. Mock Hedera sequence generation
        $hedera_seq = "0.0." . rand(1000000, 9999999);

        // 4. Update the Donation
        $uQuery = "UPDATE donations SET 
                   status = 'Remis', 
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
            ':id' => $donation_id
        ]);

        // 5. Update Validator Reputation (+5 points for a successful delivery)
        $rQuery = "UPDATE users SET reputation_score = reputation_score + 5 WHERE id = :user_id";
        $rStmt = $db->prepare($rQuery);
        $rStmt->execute([':user_id' => $user->id]);

        // 6. Notify the Donor
        $nQuery = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, :title, :msg, 'success')";
        $nStmt = $db->prepare($nQuery);
        $nTitle = "Don Remis !";
        $nMessage = "Votre don #DON-{$donation_id} a été officiellement remis sur le terrain. La preuve a été ancrée sur la blockchain.";
        $nStmt->execute([
            ':uid' => $donation['user_id'],
            ':title' => $nTitle,
            ':msg' => $nMessage
        ]);

        $db->commit();

        http_response_code(200);
        echo json_encode(["message" => "Delivery confirmed and anchored to Hedera.", "hedera_sequence" => $hedera_seq]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(400);
        echo json_encode(["message" => $e->getMessage()]);
    }
}
?>
