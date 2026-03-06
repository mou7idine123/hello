<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/Database.php';
require_once '../config/JwtHandler.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($db && !empty($data->email) && !empty($data->password)) {
    try {
        $query = "SELECT id, full_name, email, password, phone, role, is_anonymous FROM users WHERE email = :email LIMIT 0,1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (password_verify($data->password, $row['password'])) {
                unset($row['password']); // Don't send password back
                
                $jwt = new JwtHandler();
                $token = $jwt->encode([
                    "id" => $row['id'],
                    "role" => $row['role'],
                    "email" => $row['email'],
                    "full_name" => $row['full_name']
                ]);

                http_response_code(200);
                echo json_encode(array("message" => "Login successful.", "token" => $token, "user" => $row));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Login failed. Invalid password."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Login failed. User not found."));
        }
    } catch(PDOException $e) {
        http_response_code(503);
        echo json_encode(array("message" => "Database error. " . $e->getMessage()));
    }
} else if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed. Please ensure MySQL is running."));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to login. Data is incomplete."));
}
?>
