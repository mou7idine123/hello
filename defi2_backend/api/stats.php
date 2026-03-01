<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

// Commencer avec les valeurs par défaut standard comme spécifié (0s)
$stats = [
    'families_helped' => 0,
    'mru_collected' => 0,
    'confirmed_donations' => 0
];

if($db){
    try {
        // Structures de requête prêtes pour l'intégration en équipe :
        // Exemples : 
        // $stmt = $db->query("SELECT SUM(families_helped) AS helped, SUM(total_mru) AS mru, COUNT(id) AS donations FROM stats");
        // $row = $stmt->fetch(PDO::FETCH_ASSOC);
        // if($row) { 
        //      $stats['families_helped'] = $row['helped'] ?? 0;
        //      $stats['mru_collected'] = $row['mru'] ?? 0;
        //      $stats['confirmed_donations'] = $row['donations'] ?? 0;
        // }
    } catch(PDOException $e) {
        // Repli silencieux vers les tableaux par défaut si les tables sont manquantes
    }
}

echo json_encode($stats);
?>
