<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    
    if (!$user_id) {
        http_response_code(400);
        echo json_encode(["message" => "Missing user_id parameter."]);
        exit;
    }

    $query = "SELECT pp.* 
              FROM partner_payments pp
              JOIN partners p ON pp.partner_id = p.id
              WHERE p.user_id = :user_id
              ORDER BY pp.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    
    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($payments);
}
?>
