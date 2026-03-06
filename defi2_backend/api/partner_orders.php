<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
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
        // If status is 'pret_pour_collecte', notify the validator (Phase 3 transition)
        if ($status === 'pret_pour_collecte') {
            try {
                // 1. Get need_id, partner business_name and validator user_id
                $infoQuery = "SELECT po.need_id, p.business_name, n.type as need_type, u.id as validator_uid
                             FROM partner_orders po
                             JOIN partners p ON po.partner_id = p.id
                             JOIN needs n ON po.need_id = n.id
                             JOIN users u ON n.validator_name = u.full_name
                             WHERE po.id = :order_id";
                $infoStmt = $db->prepare($infoQuery);
                $infoStmt->execute([':order_id' => $order_id]);
                $info = $infoStmt->fetch(PDO::FETCH_ASSOC);

                if ($info) {
                    $notifQuery = "INSERT INTO notifications (user_id, title, message, type, related_id, related_type) 
                                 VALUES (:uid, :title, :msg, 'success', :rid, 'order')";
                    $notifStmt = $db->prepare($notifQuery);
                    $notifStmt->execute([
                        ':uid' => $info['validator_uid'],
                        ':title' => "Aide prête de collecte",
                        ':msg' => "Le partenaire " . $info['business_name'] . " a marqué l'aide comme 'pret_pour_collecte'. Vous pouvez venir la récupérer.",
                        ':rid' => $order_id
                    ]);
                }
            } catch (Exception $e) {
                // Log error but don't fail the order update
                error_log("Notification failed: " . $e->getMessage());
            }
        }
        echo json_encode(["message" => "Order updated successfully."]);
    }
 else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to update order."]);
    }
}
?>
