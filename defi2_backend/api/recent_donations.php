<?php
require_once __DIR__ . '/../config/cors.php';

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$donations = []; // Zéro transaction par défaut

if($db){
    try {
        // Prêt pour que les coéquipiers injectent les noms de tables et colonnes :
        // $query = "SELECT tx_id AS id, amount, district, transaction_date AS date, status FROM transactions ORDER BY transaction_date DESC LIMIT 5";
        // $stmt = $db->prepare($query);
        // $stmt->execute();
        // $donations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        // Repli vers une liste vide gracieusement 
    }
}

echo json_encode($donations);
?>
