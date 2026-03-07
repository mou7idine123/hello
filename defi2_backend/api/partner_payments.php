<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../config/Database.php';
require_once '../config/AuthMiddleware.php';

// Validated by Role
$user = AuthMiddleware::checkRole(['partner']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // We need to find the partner_id for THIS user
    $partnerQuery = "SELECT id FROM partners WHERE user_id = :uid";
    $pStmt = $db->prepare($partnerQuery);
    $pStmt->execute([':uid' => $user->id]);
    $partner = $pStmt->fetch(PDO::FETCH_ASSOC);

    if (!$partner) {
        echo json_encode([]);
        exit;
    }

    $partner_id = $partner['id'];

    // List all payments for this partner
    $query = "SELECT pp.*, po.orders as order_details, n.type as need_type, n.district, n.beneficiaries
              FROM partner_payments pp
              JOIN partner_orders po ON pp.order_id = po.id
              JOIN needs n ON po.need_id = n.id
              WHERE pp.partner_id = :pid
              ORDER BY pp.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':pid' => $partner_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
