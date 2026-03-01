<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die();

if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
    exit;
}

try {
    $query = "SELECT d.id, d.amount, d.status, d.tracking_id as tracking_id, d.created_at as date, n.type, n.district 
              FROM donations d
              LEFT JOIN needs n ON d.need_id = n.id
              WHERE d.user_id = ?
              ORDER BY d.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([$user_id]);

    $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($donations);
} catch(PDOException $e) {
    echo json_encode(array("message" => "Database error. " . $e->getMessage()));
}
?>
