<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($db && !empty($data->user_id) && !empty($data->need_id) && !empty($data->amount) && !empty($data->tracking_id)) {
    try {
        $query = "INSERT INTO donations (user_id, need_id, amount, tracking_id, is_anonymous, status) 
                  VALUES (:user_id, :need_id, :amount, :tracking_id, :is_anonymous, 'En attente de virement')";
        
        $stmt = $db->prepare($query);

        $stmt->bindParam(':user_id', $data->user_id);
        $stmt->bindParam(':need_id', $data->need_id);
        $stmt->bindParam(':amount', $data->amount);
        $stmt->bindParam(':tracking_id', $data->tracking_id);
        $stmt->bindParam(':is_anonymous', $data->is_anonymous, PDO::PARAM_BOOL);

        if ($stmt->execute()) {
            // Update collected_mru in needs table
            $update_query = "UPDATE needs SET collected_mru = collected_mru + :amount WHERE id = :need_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':amount', $data->amount);
            $update_stmt->bindParam(':need_id', $data->need_id);
            $update_stmt->execute();

            http_response_code(201);
            echo json_encode(array("message" => "Donation created.", "donation_id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create donation."));
        }
    } catch(PDOException $e) {
        http_response_code(503);
        echo json_encode(array("message" => "Database error. " . $e->getMessage()));
    }
} else if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create donation. Data is incomplete."));
}
?>
