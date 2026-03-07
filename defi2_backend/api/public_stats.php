<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$stats = [
    "total_families" => 0,
    "total_mru" => 0,
    "total_donations" => 0,
    "active_needs" => 0
];

try {
    // Families helped (sum of beneficiaries for completed needs)
    $stmt1 = $db->query("SELECT SUM(beneficiaries) as total FROM needs WHERE status = 'complete'");
    $res1 = $stmt1->fetch(PDO::FETCH_ASSOC);
    $stats['total_families'] = $res1['total'] ? (int)$res1['total'] : 0;

    // Total MRU collected (sum from verified/remitted donations)
    $stmt2 = $db->query("SELECT SUM(amount) as total FROM donations WHERE status IN ('Vérifié', 'Remis')");
    $res2 = $stmt2->fetch(PDO::FETCH_ASSOC);
    $stats['total_mru'] = $res2['total'] ? (float)$res2['total'] : 0;

    // Total successful donations (count)
    $stmt3 = $db->query("SELECT COUNT(*) as count FROM donations WHERE status IN ('Vérifié', 'Remis')");
    $res3 = $stmt3->fetch(PDO::FETCH_ASSOC);
    $stats['total_donations'] = $res3['count'] ? (int)$res3['count'] : 0;

    // Active needs count
    $stmt4 = $db->query("SELECT COUNT(*) as count FROM needs WHERE status = 'Open'");
    $res4 = $stmt4->fetch(PDO::FETCH_ASSOC);
    $stats['active_needs'] = $res4['count'] ? (int)$res4['count'] : 0;

    echo json_encode($stats);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
