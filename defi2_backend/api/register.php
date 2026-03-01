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

if ($db && !empty($data->full_name) && !empty($data->email) && !empty($data->password)) {
    try {
        $query = "INSERT INTO users (full_name, email, password, phone, is_anonymous) VALUES (:full_name, :email, :password, :phone, :is_anonymous)";
        $stmt = $db->prepare($query);

        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        $stmt->bindParam(':full_name', $data->full_name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':password', $password_hash);
        $stmt->bindParam(':phone', $data->phone);
        $stmt->bindParam(':is_anonymous', $data->is_anonymous, PDO::PARAM_BOOL);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "User was created.", "user_id" => $db->lastInsertId()));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create user."));
        }
    } catch(PDOException $e) {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create user. " . $e->getMessage()));
    }
} else if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed. Please ensure MySQL is running and the 'ihsan_platform' database is created."));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
}
?>
