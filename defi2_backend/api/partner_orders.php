<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

function notifyValidator($db, $order_id) {
    try {
        $infoQuery = "SELECT po.need_id, p.business_name, n.type as need_type, n.validator_id as validator_uid
                     FROM partner_orders po
                     JOIN partners p ON po.partner_id = p.id
                     JOIN needs n ON po.need_id = n.id
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
        error_log("Notification failed for order $order_id: " . $e->getMessage());
    }
}

function syncOrders($db) {
    // 1. Auto-transition en_preparation -> pret_pour_collecte if time reached
    $query = "SELECT id FROM partner_orders 
              WHERE status = 'en_preparation' 
              AND scheduled_time <= NOW()";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $expiredOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($expiredOrders as $order) {
        $upd = "UPDATE partner_orders SET status = 'pret_pour_collecte' WHERE id = :id";
        $db->prepare($upd)->execute([':id' => $order['id']]);
        notifyValidator($db, $order['id']);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    syncOrders($db);
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
              JOIN needs n ON po.need_id = n.id
              WHERE p.user_id = :user_id AND n.status IN ('finance', 'en_cours', 'remise_a_verifier', 'complete')";

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
    syncOrders($db);
    // Update order status
    $data = json_decode(file_get_contents("php://input"));
    $order_id = isset($data->order_id) ? $data->order_id : null;
    $status = isset($data->status) ? $data->status : null; 
    $scheduled_time = isset($data->scheduled_time) ? $data->scheduled_time : null;
    
    if (!$order_id || !$status) {
        http_response_code(400);
        echo json_encode(["message" => "Missing parameters."]);
        exit;
    }
    
    // If manually marking as ready, update scheduled_time to now
    if ($status === 'pret_pour_collecte') {
        $scheduled_time = date('Y-m-d H:i:s');
    }

    $query = "UPDATE partner_orders SET status = :status" . ($scheduled_time ? ", scheduled_time = :stime" : "") . " WHERE id = :order_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $status);
    if ($scheduled_time) {
        $stmt->bindParam(':stime', $scheduled_time);
    }
    $stmt->bindParam(':order_id', $order_id);
    
    if ($stmt->execute()) {
        try {
            // Get need_id and other info
            $infoQuery = "SELECT po.need_id FROM partner_orders po WHERE po.id = :order_id";
            $infoStmt = $db->prepare($infoQuery);
            $infoStmt->execute([':order_id' => $order_id]);
            $info = $infoStmt->fetch(PDO::FETCH_ASSOC);

            if ($info) {
                // If status is 'en_preparation', update need status to 'en_cours'
                if ($status === 'en_preparation') {
                    $updNeed = "UPDATE needs SET status = 'en_cours' WHERE id = :nid";
                    $db->prepare($updNeed)->execute([':nid' => $info['need_id']]);
                }

                // If status is 'pret_pour_collecte', notify the validator
                if ($status === 'pret_pour_collecte') {
                    notifyValidator($db, $order_id);
                }
            }
        } catch (Exception $e) {
            error_log("Post-update logic failed: " . $e->getMessage());
        }
        echo json_encode(["message" => "Order updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Failed to update order."]);
    }
}
?>
