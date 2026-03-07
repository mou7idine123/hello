<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validate JWT and Role
$user = AuthMiddleware::checkRole(['validator']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stats = [
        "active_needs" => 0,
        "donations_to_process" => 0,
        "reputation_score" => 0,
        "total_families_helped" => 0,
        "needs_list" => []
    ];

    try {
        // Validator score
        $q_user = "SELECT score FROM users WHERE id = :id";
        $s1 = $db->prepare($q_user);
        $s1->execute([':id' => $user->id]);
        $stats['validator_score'] = $s1->fetch(PDO::FETCH_ASSOC)['score'] ?? 20;

        // Active Needs with their order status and partner info
        $q_needs = "SELECT n.*, 
                          po.status as order_status, po.id as order_id, po.scheduled_time,
                          p.business_name as partner_name, p.address as partner_gps, 
                          p.opening_hours as partner_hours, p.specialties as partner_specialties
                   FROM needs n 
                   LEFT JOIN partner_orders po ON n.id = po.need_id
                   LEFT JOIN partners p ON po.partner_id = p.id
                   WHERE n.validator_id = :vid 
                   ORDER BY n.created_at DESC";
        $s2 = $db->prepare($q_needs);
        $s2->execute([':vid' => $user->id]);
        $stats['needs_list'] = $s2->fetchAll(PDO::FETCH_ASSOC);

        // Calculate some stats from needs
        $activeCount = 0;
        $families = 0;
        $needIds = [];

        foreach($stats['needs_list'] as $need) {
            if ($need['status'] === 'ouvert' || $need['status'] === 'finance' || $need['status'] === 'en_cours') {
                $activeCount++;
            }
            if ($need['status'] === 'finance') { // Count families only for funded needs or general
                $families += (int)$need['beneficiaries'];
            }
            $needIds[] = $need['id'];
        }
        
        $stats['active_needs'] = $activeCount;
        $stats['total_families_helped'] = $families;

        // Donations to process (Vérifié -> waiting for validator to confirm delivery Remis)
        if (count($needIds) > 0) {
            $inClause = implode(',', array_fill(0, count($needIds), '?'));
            $q_don = "SELECT COUNT(*) as count FROM donations WHERE status = 'verifie' AND need_id IN ($inClause)";
            $s3 = $db->prepare($q_don);
            $s3->execute($needIds);
            $stats['donations_to_process'] = $s3->fetch(PDO::FETCH_ASSOC)['count'];
        }

        echo json_encode($stats);

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
    }
}
?>
