<?php
require_once __DIR__ . '/../config/cors.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

try {
    // Fetch completed needs that have a remise proof
    $query = "SELECT n.id, n.type, n.description, n.remise_proof_path, n.remise_message, n.remise_time,
                     v.full_name as validator_name, v.score as validator_score,
                     (SELECT d.id FROM donations d WHERE d.need_id = n.id LIMIT 1) as representative_donation_id
              FROM needs n
              LEFT JOIN users v ON n.validator_id = v.id
              WHERE n.status = 'complete' AND n.remise_proof_path IS NOT NULL
              ORDER BY n.remise_time DESC
              LIMIT 6";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($results);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
