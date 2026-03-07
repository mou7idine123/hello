<?php
require_once __DIR__ . '/../config/cors.php';

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
        // Calculate real stats
        $stats['families_helped'] = (int) $db->query("SELECT SUM(beneficiaries) FROM needs WHERE status = 'complete'")->fetchColumn();
        $stats['mru_collected'] = (float) $db->query("SELECT SUM(collected_mru) FROM needs")->fetchColumn();
        $stats['confirmed_donations'] = (int) $db->query("SELECT COUNT(*) FROM donations WHERE status IN ('Vérifié', 'Remis')")->fetchColumn();

        // Fetch active announcements
        $stmt = $db->query("SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC");
        $stats['announcements'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch(PDOException $e) {
        // Silently fallback if anything goes wrong
    }
}

echo json_encode($stats);
?>
