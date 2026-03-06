<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validate JWT and Role
$user = AuthMiddleware::checkRole(['validator', 'admin']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    $need_id = $data->need_id ?? null;
    $partner_id = $data->partner_id ?? null;
    $scheduled_time = $data->scheduled_time ?? date('Y-m-d H:i:s', strtotime('+2 hours'));

    if (!$need_id || !$partner_id) {
        http_response_code(400);
        echo json_encode(["message" => "need_id and partner_id are required."]);
        exit;
    }

    try {
        $db->beginTransaction();

        // 1. Fetch the need details
        $q_need = "SELECT * FROM needs WHERE id = :id FOR UPDATE";
        $s_need = $db->prepare($q_need);
        $s_need->execute([':id' => $need_id]);
        $need = $s_need->fetch(PDO::FETCH_ASSOC);

        if (!$need) {
            throw new Exception("Need not found.");
        }

        if ($need['status'] !== 'finance') {
            throw new Exception("Le besoin doit être au statut 'finance' pour passer une commande.");
        }

        // 2. Create the partner order
        // We aggregate the whole need into one order for the partner
        $q_order = "INSERT INTO partner_orders (partner_id, need_id, item_type, quantity, scheduled_time, status) 
                    VALUES (:pid, :nid, :itype, :qty, :stime, 'en_attente')";
        $s_order = $db->prepare($q_order);
        $s_order->execute([
            ':pid' => $partner_id,
            ':nid' => $need_id,
            ':itype' => $need['type'],
            ':qty' => $need['beneficiaries'],
            ':stime' => $scheduled_time
        ]);

        // 3. Update the need status
        $q_update = "UPDATE needs SET status = 'en_cours' WHERE id = :id";
        $s_update = $db->prepare($q_update);
        $s_update->execute([':id' => $need_id]);

        $db->commit();
        echo json_encode(["message" => "Order placed successfully.", "order_id" => $db->lastInsertId()]);

    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        http_response_code(500);
        echo json_encode(["message" => "Failed to place order.", "error" => $e->getMessage()]);
    }
}
?>
