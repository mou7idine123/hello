<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validate JWT and Role
$user = AuthMiddleware::checkRole(['validator']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (
        !empty($data->type) &&
        !empty($data->district) &&
        !empty($data->description) &&
        !empty($data->full_description) &&
        !empty($data->required_mru) &&
        !empty($data->beneficiaries)
    ) {
        try {
            $query = "INSERT INTO needs (type, district, description, full_description, required_mru, validator_name, beneficiaries, deadline_date, status) 
                      VALUES (:type, :district, :description, :full_description, :required_mru, :validator_name, :beneficiaries, :deadline_date, 'ouvert')";
            
            $stmt = $db->prepare($query);

            $stmt->bindParam(':type', $data->type);
            $stmt->bindParam(':district', $data->district);
            $stmt->bindParam(':description', $data->description);
            $stmt->bindParam(':full_description', $data->full_description);
            $stmt->bindParam(':required_mru', $data->required_mru);
            $stmt->bindParam(':validator_name', $user->full_name);
            $stmt->bindParam(':beneficiaries', $data->beneficiaries);
            
            // Deadline date is optional
            $deadline = !empty($data->deadline_date) ? $data->deadline_date : null;
            $stmt->bindParam(':deadline_date', $deadline);

            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Need was successfully created."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Failed to create need."));
            }
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(array("message" => "Database error.", "error" => $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Data incomplete."));
    }
}
?>
