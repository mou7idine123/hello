<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Fetch all validators along with their number of completed (remise) needs
    $query = "SELECT u.id, u.full_name, u.score, u.created_at, 
              (SELECT COUNT(*) FROM needs n WHERE n.validator_id = u.id AND n.status = 'complete') as completed_deliveries,
              (SELECT COUNT(*) FROM needs n WHERE n.validator_id = u.id) as total_needs
              FROM users u 
              WHERE u.role = 'validator' 
              ORDER BY u.score DESC";
    
    $stmt = $db->query($query);
    $validators = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($validators);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
