<?php
require_once __DIR__ . '/../../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
AuthMiddleware::checkRole(['admin']);

$database = new Database();
$db = $database->getConnection();

function syncPayments($db) {
    // 1. Find orders that have reached their scheduled time but have no payment entry yet
    // We get the amount from the related need.required_mru
    $query = "INSERT INTO partner_payments (partner_id, order_id, amount, status)
              SELECT po.partner_id, po.id, n.required_mru, 'En attente'
              FROM partner_orders po
              JOIN needs n ON po.need_id = n.id
              LEFT JOIN partner_payments pp ON po.id = pp.order_id
              WHERE po.scheduled_time <= NOW()
              AND pp.id IS NULL";
    
    $db->prepare($query)->execute();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    syncPayments($db);

    // List all payments with partner and order info
    $query = "SELECT pp.*, p.business_name as partner_name, po.orders as order_details, n.type as need_type
              FROM partner_payments pp
              JOIN partners p ON pp.partner_id = p.id
              JOIN partner_orders po ON pp.order_id = po.id
              JOIN needs n ON po.need_id = n.id
              ORDER BY pp.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));

} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Settle payment
    $data = json_decode(file_get_contents("php://input"));
    $payment_id = $data->payment_id ?? null;
    $transaction_ref = $data->transaction_ref ?? null;
    $payment_date = $data->payment_date ?? date('Y-m-d H:i:s');

    if (!$payment_id || !$transaction_ref) {
        http_response_code(400);
        echo json_encode(["message" => "Payment ID and Transaction Reference are required."]);
        exit;
    }

    try {
        $query = "UPDATE partner_payments 
                  SET transaction_ref = :ref, status = 'Payé', payment_date = :pdate 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            ':ref' => $transaction_ref,
            ':pdate' => $payment_date,
            ':id' => $payment_id
        ]);

        echo json_encode(["message" => "Payment settled successfully."]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => $e->getMessage()]);
    }
}
?>
