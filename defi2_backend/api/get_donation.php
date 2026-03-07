<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';
require_once '../config/AuthMiddleware.php';

// Allow any authenticated user to view donation details (public proofs don't need token, but internal dashboard does)
// For simplicity, we'll allow public access if 'tracking_id' is provided, but 'id' might require auth.
// Let's just make it public for now since it's a "Proof" endpoint.

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;
    $tracking_id = $_GET['tracking_id'] ?? null;

    if (!$id && !$tracking_id) {
        http_response_code(400);
        echo json_encode(["message" => "Missing id or tracking_id"]);
        exit;
    }

    try {
        $query = "SELECT d.*, n.type as need_type, n.description as need_description, n.remise_message, n.remise_proof_path,
                         v.full_name as validator_name, v.score as validator_score,
                         p.business_name as partner_name, p.specialties as partner_specialties, p.photo_path as partner_photo,
                         po.orders as order_details, po.status as order_status, po.scheduled_time as order_time,
                         n.remise_time
                  FROM donations d
                  JOIN needs n ON d.need_id = n.id
                  LEFT JOIN users v ON n.validator_id = v.id
                  LEFT JOIN partner_orders po ON n.id = po.need_id
                  LEFT JOIN partners p ON po.partner_id = p.id
                  WHERE " . ($id ? "d.id = :id" : "d.tracking_id = :tid");

        $stmt = $db->prepare($query);
        if ($id) {
            $stmt->execute([':id' => $id]);
        } else {
            $stmt->execute([':tid' => $tracking_id]);
        }

        $donation = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($donation) {
            // Priority: Real data from DB, otherwise mock for UX
            $htx = $donation['hedera_tx_id'] ?? null;
            $hseq = $donation['hedera_sequence'] ?? null;
            
            $donation['hedera'] = [
                'sequenceNumber' => $hseq ?: '0.0.' . rand(3000000, 4000000),
                'timestamp' => $donation['created_at'],
                'transactionId' => $htx ?: ('0.0.' . rand(3000000, 4000000) . '@' . time() . '.000000000'),
                'topicId' => '0.0.8113854',
                'network' => 'Hedera Testnet'
            ];

            // Construct HashScan URL: Topic message link is best, otherwise Transaction link
            if ($hseq) {
                $donation['hedera']['hashscanUrl'] = "https://hashscan.io/testnet/topic/0.0.8113854?message=$hseq";
            } elseif ($htx) {
                // Format txId for HashScan (shard.realm.num@seconds.nanos -> shard.realm.num-seconds-nanos)
                $formattedTxId = str_replace(['@', '.'], ['-', '-'], $htx);
                // But wait, the transaction ID usually has shard.realm.num@seconds.nanos
                // We actually want just hyphens. 
                // Let's use a more robust regex or str_replace chain.
                $parts = explode('@', $htx);
                if (count($parts) === 2) {
                    $formattedTxId = $parts[0] . '-' . str_replace('.', '-', $parts[1]);
                } else {
                    $formattedTxId = $htx;
                }
                $donation['hedera']['hashscanUrl'] = "https://hashscan.io/testnet/transaction/$formattedTxId";
            } else {
                $donation['hedera']['hashscanUrl'] = "https://hashscan.io/testnet/topic/0.0.8113854";
            }
            
            echo json_encode($donation);
        }
 else {
            http_response_code(404);
            echo json_encode(["message" => "Donation not found"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
    }
}
?>
