<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';
require_once '../config/AuthMiddleware.php';

// Validated by token, no specific role requirement
$user = AuthMiddleware::checkToken();

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT * FROM notifications WHERE user_id = :uid ORDER BY created_at DESC LIMIT 50";
        $stmt = $db->prepare($query);
        $stmt->execute([':uid' => $user->id]);
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($notifications);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Mark a notification as read
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->notification_id)) {
        try {
            $query = "UPDATE notifications SET is_read = TRUE WHERE id = :id AND user_id = :uid";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $data->notification_id, ':uid' => $user->id]);
            echo json_encode(["message" => "Notification marked as read"]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Missing notification_id"]);
    }
}
?>
