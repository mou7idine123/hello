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
            $query = "INSERT INTO needs (type, district, description, full_description, required_mru, validator_id, beneficiaries, deadline_date, gps_coordinates, status) 
                      VALUES (:type, :district, :description, :full_description, :required_mru, :validator_id, :beneficiaries, :deadline_date, :gps_coordinates, 'ouvert')";
            
            $stmt = $db->prepare($query);

            $stmt->bindParam(':type', $data->type);
            $stmt->bindParam(':district', $data->district);
            $stmt->bindParam(':description', $data->description);
            $stmt->bindParam(':full_description', $data->full_description);
            $stmt->bindParam(':required_mru', $data->required_mru);
            $stmt->bindParam(':validator_id', $user->id);
            $stmt->bindParam(':beneficiaries', $data->beneficiaries);
            
            // Optional fields
            $deadline = !empty($data->deadline_date) ? $data->deadline_date : null;
            $stmt->bindParam(':deadline_date', $deadline);
            
            $gps = !empty($data->gps_coordinates) ? $data->gps_coordinates : null;
            $stmt->bindParam(':gps_coordinates', $gps);

            if ($stmt->execute()) {
                $need_id = $db->lastInsertId();

                // Update validator's score: +5 for creating a need
                $uScore = "UPDATE users SET score = IFNULL(score, 20) + 5 WHERE id = :uid";
                $db->prepare($uScore)->execute([':uid' => $user->id]);

                // Create Partner Order if provided
                if (!empty($data->partner_id) && !empty($data->partner_orders)) {
                    $orderQuery = "INSERT INTO partner_orders (partner_id, orders, need_id, validator_id, scheduled_time, status) 
                                 VALUES (:partner_id, :orders, :need_id, :validator_id, :scheduled, 'en_attente')";
                    $orderStmt = $db->prepare($orderQuery);
                    
                    // Default scheduled time: 24 hours from now
                    $defaultScheduled = date('Y-m-d H:i:s', strtotime('+24 hours'));
                    
                    $orderStmt->bindParam(':partner_id', $data->partner_id);
                    $orderStmt->bindParam(':orders', $data->partner_orders);
                    $orderStmt->bindParam(':need_id', $need_id);
                    $orderStmt->bindParam(':validator_id', $user->id);
                    $orderStmt->bindParam(':scheduled', $defaultScheduled);
                    $orderStmt->execute();
                }

                http_response_code(201);
                echo json_encode(array("message" => "Need and Partner Order successfully created."));
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
