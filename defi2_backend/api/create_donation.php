<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if ($db && !empty($data->user_id) && !empty($data->need_id) && !empty($data->amount) && !empty($data->tracking_id)) {
    try {
        $db->beginTransaction();

        // Generate SHA-256 Hash for the donation (immutability requirement)
        $sha256_hash = hash('sha256', $data->tracking_id . microtime());

        $query = "INSERT INTO donations (user_id, need_id, amount, tracking_id, sha256_hash, is_anonymous, status) 
                  VALUES (:user_id, :need_id, :amount, :tracking_id, :sha256_hash, :is_anonymous, 'En attente de virement')";
        
        $stmt = $db->prepare($query);

        $stmt->bindParam(':user_id', $data->user_id);
        $stmt->bindParam(':need_id', $data->need_id);
        $stmt->bindParam(':amount', $data->amount);
        $stmt->bindParam(':tracking_id', $data->tracking_id);
        $stmt->bindParam(':sha256_hash', $sha256_hash);
        $stmt->bindParam(':is_anonymous', $data->is_anonymous, PDO::PARAM_BOOL);

        if ($stmt->execute()) {
            $donation_id = $db->lastInsertId();

            // 1. Update collected_mru in needs table
            $update_query = "UPDATE needs SET collected_mru = collected_mru + :amount WHERE id = :need_id";
            $update_stmt = $db->prepare($update_query);
            $update_stmt->bindParam(':amount', $data->amount);
            $update_stmt->bindParam(':need_id', $data->need_id);
            $update_stmt->execute();

            // 2. Check if the need is now funded (Phase 2 requirement)
            $check_query = "SELECT id, required_mru, collected_mru, type FROM needs WHERE id = :need_id FOR UPDATE";
            $check_stmt = $db->prepare($check_query);
            $check_stmt->execute([':need_id' => $data->need_id]);
            $need = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if ($need && $need['collected_mru'] >= $need['required_mru']) {
                // Change status to 'finance'
                $final_query = "UPDATE needs SET status = 'finance' WHERE id = :need_id";
                $db->prepare($final_query)->execute([':need_id' => $data->need_id]);

                // 3. Automated Notification to Partner (Phase 2 requirement)
                // For now, we find the first registered partner in the same district or just any partner
                $partner_query = "SELECT p.id, p.user_id FROM partners p JOIN users u ON p.user_id = u.id LIMIT 1";
                $partner = $db->query($partner_query)->fetch(PDO::FETCH_ASSOC);

                if ($partner) {
                    // Create an automated order for the partner (Phase 3 initialization)
                    $order_query = "INSERT INTO partner_orders (partner_id, need_id, item_type, quantity, status) 
                                   VALUES (:pid, :nid, :type, :qty, 'en_attente')";
                    $db->prepare($order_query)->execute([
                        ':pid' => $partner['id'],
                        ':nid' => $data->need_id,
                        ':type' => $need['type'],
                        ':qty' => 1 // Simplified: 1 aid unit
                    ]);

                    // Send notification
                    $notif_query = "INSERT INTO notifications (user_id, title, message, type) 
                                   VALUES (:uuid, 'Nouveau don à préparer', 'Un besoin vient dêtre financé et nécessite votre préparation.', 'info')";
                    $db->prepare($notif_query)->execute([':uuid' => $partner['user_id']]);
                }
            }

            $db->commit();
            http_response_code(201);
            echo json_encode(array("message" => "Donation created and hashed.", "donation_id" => $donation_id, "hash" => $sha256_hash));
        } else {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create donation."));
        }
    } catch(Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        http_response_code(500);
        echo json_encode(array("message" => "Error: " . $e->getMessage()));
    }
}
 else if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed."));
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create donation. Data is incomplete."));
}
?>
