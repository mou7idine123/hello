<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$needs = []; // Par défaut, un tableau vide

if($db){
    try {
        $query = "SELECT id, type, district, required_mru, collected_mru, validator_name AS validator, status, description, full_description, beneficiaries FROM needs";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch(PDOException $e) {
        // Revenir silencieusement aux valeurs vides par défaut sans terminer le script lorsque les tables sont absentes
    }
}

echo json_encode($needs);
?>
