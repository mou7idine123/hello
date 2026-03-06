<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validate JWT and Role
AuthMiddleware::checkRole(['validator', 'admin']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "SELECT p.id, p.business_name, p.address, u.phone, u.email 
                  FROM partners p
                  JOIN users u ON p.user_id = u.id
                  WHERE u.is_active = 1
                  ORDER BY p.business_name ASC";
        
        $stmt = $db->query($query);
        $partners = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($partners);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching partners", "error" => $e->getMessage()]);
    }
}
?>
