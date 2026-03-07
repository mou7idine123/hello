<?php
require_once __DIR__ . '/../config/cors.php';

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$donations = []; // Zéro transaction par défaut

if($db){
    try {
        $query = "SELECT d.id, d.amount, n.district, d.created_at as date, d.status, d.hedera_sequence 
                  FROM donations d
                  JOIN needs n ON d.need_id = n.id
                  WHERE d.status = 'verifie'
                  ORDER BY d.created_at DESC 
                  LIMIT 5";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        // Fallback to empty list gracefully
    }
}

echo json_encode($donations);
?>
