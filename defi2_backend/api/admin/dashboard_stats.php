<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stats = [
        "total_donations" => 0,
        "pending_verifications" => 0,
        "confirmed_donations" => 0,
        "total_collected" => 0
    ];

    try {
        // Today's total donations (count)
        $q1 = "SELECT COUNT(*) as count FROM donations WHERE DATE(created_at) = CURDATE()";
        $stmt1 = $db->query($q1);
        $stats['total_donations'] = $stmt1->fetch(PDO::FETCH_ASSOC)['count'];

        // Pending verifications
        $q2 = "SELECT COUNT(*) as count FROM donations WHERE status = 'en_attente'";
        $stmt2 = $db->query($q2);
        $stats['pending_verifications'] = $stmt2->fetch(PDO::FETCH_ASSOC)['count'];

        // Confirmed donations (all time)
        $q3 = "SELECT COUNT(*) as count FROM donations WHERE status = 'verifie'";
        $stmt3 = $db->query($q3);
        $stats['confirmed_donations'] = $stmt3->fetch(PDO::FETCH_ASSOC)['count'];

        // Total collected
        $q4 = "SELECT SUM(amount) as total FROM donations WHERE status = 'verifie'";
        $stmt4 = $db->query($q4);
        $res = $stmt4->fetch(PDO::FETCH_ASSOC);
        $stats['total_collected'] = $res['total'] ? $res['total'] : 0;

        // Weekly total count (last 7 days)
        $q_weekly = "SELECT COUNT(*) as count FROM donations WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
        $stmt_weekly = $db->query($q_weekly);
        $stats['weekly_total_count'] = $stmt_weekly->fetch(PDO::FETCH_ASSOC)['count'];

        // Monthly collected (current month)
        $q_monthly = "SELECT SUM(amount) as total FROM donations WHERE status = 'verifie' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
        $stmt_monthly = $db->query($q_monthly);
        $res_m = $stmt_monthly->fetch(PDO::FETCH_ASSOC);
        $stats['monthly_collected'] = $res_m['total'] ? (float)$res_m['total'] : 0;

        // Monthly objective (Fetch from settings or default)
        $q_obj = "SELECT setting_value FROM platform_settings WHERE setting_key = 'monthly_objective' LIMIT 1";
        $stmt_obj = $db->query($q_obj);
        $res_obj = $stmt_obj->fetch(PDO::FETCH_ASSOC);
        $stats['monthly_objective'] = $res_obj ? (float)$res_obj['setting_value'] : 100000; // Default 100k if not set

        // Graph: Donations evolution by week
        $q_week = "SELECT DATE(created_at) as date, SUM(amount) as total FROM donations WHERE status = 'verifie' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date ASC";
        $stmt_week = $db->query($q_week);
        $stats['graph_week'] = $stmt_week->fetchAll(PDO::FETCH_ASSOC);

        // Graph: Donations by district
        $q_district = "SELECT n.district, SUM(d.amount) as total FROM donations d JOIN needs n ON d.need_id = n.id WHERE d.status = 'verifie' GROUP BY n.district";
        $stmt_district = $db->query($q_district);
        $stats['graph_district'] = $stmt_district->fetchAll(PDO::FETCH_ASSOC);

        // Graph: Donations by need type
        $q_type = "SELECT n.type, SUM(d.amount) as total FROM donations d JOIN needs n ON d.need_id = n.id WHERE d.status = 'verifie' GROUP BY n.type";
        $stmt_type = $db->query($q_type);
        $stats['graph_type'] = $stmt_type->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($stats);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
    }
}
?>
