<?php
require_once __DIR__ . '/../config/cors.php';

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$needs = []; // Par défaut, un tableau vide

if($db){
    try {
        // Query to get needs along with validator reputation and delivery counts
        $query = "SELECT 
                    n.id, n.type, n.district, n.required_mru, n.collected_mru, 
                    u.full_name AS validator, n.status, n.description, 
                    n.full_description, n.beneficiaries,
                    n.remise_proof_path, n.remise_message, n.remise_time,
                    u.score AS validator_score,
                    (SELECT COUNT(*) FROM needs n2 WHERE n2.validator_id = n.validator_id AND n2.status = 'complete') AS confirmed_deliveries
                  FROM needs n
                  LEFT JOIN users u ON n.validator_id = u.id";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        // Fallback or error log
    }
}

echo json_encode($needs);
?>
