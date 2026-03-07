<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT p.id, p.business_name, p.location, p.address, p.specialties, p.opening_hours, p.photo_path, 
                     u.full_name as owner_name, u.email, u.phone 
              FROM partners p
              JOIN users u ON p.user_id = u.id
              ORDER BY p.created_at DESC";
    $stmt = $db->query($query);
    $partners = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($partners);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
