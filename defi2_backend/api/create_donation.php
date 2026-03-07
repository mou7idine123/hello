<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();


$user_id = $_POST['user_id'] ?? null;
$need_id = $_POST['need_id'] ?? null;
$amount = $_POST['amount'] ?? null;
$tracking_id = $_POST['tracking_id'] ?? null;
$is_anonymous = isset($_POST['is_anonymous']) ? (int)$_POST['is_anonymous'] : 0;
$selected_bank = $_POST['selected_bank'] ?? null;
$bank_reference = $_POST['bank_reference'] ?? null;

if ($db && !empty($user_id) && !empty($need_id) && !empty($amount) && !empty($tracking_id)) {
    try {
        $db->beginTransaction();

        // Handle Receipt Upload
        $receipt_path = null;
        if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] == 0) {
            $upload_dir = '../uploads/receipts/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            $file_ext = pathinfo($_FILES['receipt']['name'], PATHINFO_EXTENSION);
            $filename = 'receipt_' . $tracking_id . '_' . time() . '.' . $file_ext;
            $target_file = $upload_dir . $filename;
            
            if (move_uploaded_file($_FILES['receipt']['tmp_name'], $target_file)) {
                $receipt_path = 'uploads/receipts/' . $filename;
            }
        }

        // Generate SHA-256 Hash for the donation (immutability/fingerprint requirement)
        // Hashing the tracking_id and microtime ensures a unique, verifiable ID for this contribution
        $sha256_hash = hash('sha256', $tracking_id . microtime());

        $query = "INSERT INTO donations (user_id, need_id, amount, tracking_id, sha256_hash, is_anonymous, selected_bank, bank_reference, receipt_path, status) 
                  VALUES (:user_id, :need_id, :amount, :tracking_id, :sha256_hash, :is_anonymous, :selected_bank, :bank_reference, :receipt_path, 'en_attente')";
        
        $stmt = $db->prepare($query);

        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':need_id', $need_id);
        $stmt->bindParam(':amount', $amount);
        $stmt->bindParam(':tracking_id', $tracking_id);
        $stmt->bindParam(':sha256_hash', $sha256_hash);
        $stmt->bindParam(':is_anonymous', $is_anonymous, PDO::PARAM_INT);
        $stmt->bindParam(':selected_bank', $selected_bank);
        $stmt->bindParam(':bank_reference', $bank_reference);
        $stmt->bindParam(':receipt_path', $receipt_path);

        if ($stmt->execute()) {
            $donation_id = $db->lastInsertId();
            $db->commit();
            http_response_code(201);
            echo json_encode(array("message" => "Donation created and hashed.", "donation_id" => $donation_id, "hash" => $sha256_hash));
        } else {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create donation."));
        }
    } catch(Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $e->getMessage()));
    }
}
 else if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create donation. Data is incomplete."));
}
?>
