<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch orders by user_id
    $user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
    $date = isset($_GET['date']) ? $_GET['date'] : null;

    if (!$user_id) {
         echo json_encode(["message" => "Missing user_id parameter."]);
         exit;
    }

    $query = "SELECT po.*, p.business_name 
              FROM partner_orders po
              JOIN partners p ON po.partner_id = p.id
              WHERE p.user_id = :user_id";

    // Filter by date if provided (YYYY-MM-DD)
    if ($date) {
        $query .= " AND DATE(po.scheduled_time) = :date";
    }

    $query .= " ORDER BY po.scheduled_time ASC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    if ($date) {
        $stmt->bindParam(':date', $date);
    }
    
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($orders);

} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update order status
    $data = json_decode(file_get_contents("php://input"));
    $order_id = isset($data->order_id) ? $data->order_id : null;
    $status = isset($data->status) ? $data->status : null; // e.g. 'Prête'
    
    if (!$order_id || !$status) {
        http_response_code(400);
        echo json_encode(["message" => "Missing parameters."]);
        exit;
    }
    
    $query = "UPDATE partner_orders SET status = :status WHERE id = :order_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':order_id', $order_id);
    
    if ($stmt->execute()) {
        echo json_encode(["message" => "Order updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to update order."]);
    }
}
?>
