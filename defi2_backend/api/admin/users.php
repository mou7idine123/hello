<?php
require_once __DIR__ . '/../../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
AuthMiddleware::checkRole(['admin']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch all users except other admins maybe? Or just all.
    try {
        $query = "SELECT id, full_name, email, phone, role, is_active, reputation_score, score, created_at 
                  FROM users 
                  ORDER BY created_at DESC";
        $stmt = $db->query($query);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch partner details if they exist to enrich the data
        // Fetch partner details and orders processed
        $pQuery = "SELECT p.user_id, p.business_name, p.address AS location, 
                  (SELECT COUNT(*) FROM partner_orders po WHERE po.partner_id = p.id AND po.status = 'Remise') as orders_processed
                  FROM partners p";
        $pStmt = $db->query($pQuery);
        $partners = [];
        while($row = $pStmt->fetch(PDO::FETCH_ASSOC)) {
            $partners[$row['user_id']] = $row;
        }

        // Fetch validator confirmed deliveries (count of donations with status 'Remis' linked to their needs)
        // Since needs links validator by name, we join by full_name
        $vQuery = "SELECT u.id, COUNT(d.id) as confirmed_deliveries 
                   FROM users u
                   LEFT JOIN needs n ON n.validator_id = u.id
                   LEFT JOIN donations d ON d.need_id = n.id AND d.status = 'Remis'
                   WHERE u.role = 'validator'
                   GROUP BY u.id";
        $vStmt = $db->query($vQuery);
        $validators_stats = [];
        while($row = $vStmt->fetch(PDO::FETCH_ASSOC)) {
            $validators_stats[$row['id']] = $row['confirmed_deliveries'];
        }

        foreach ($users as &$user) {
            if ($user['role'] === 'partner' && isset($partners[$user['id']])) {
                $user['partner_details'] = $partners[$user['id']];
            }
            if ($user['role'] === 'validator') {
                $user['confirmed_deliveries'] = $validators_stats[$user['id']] ?? 0;
            }
        }

        echo json_encode($users);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching users", "error" => $e->getMessage()]);
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update role or active status
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->user_id) || !isset($data->action)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing parameters"]);
        exit;
    }

    try {
        if ($data->action === 'change_role' && isset($data->new_role)) {
            $allowed_roles = ['donor', 'validator', 'partner', 'admin'];
            if (!in_array($data->new_role, $allowed_roles)) throw new Exception("Invalid role");

            $query = "UPDATE users SET role = :r" . ($data->new_role === 'validator' ? ", score = IFNULL(score, 20)" : "") . " WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':r' => $data->new_role, ':id' => $data->user_id]);

        } else if ($data->action === 'toggle_status' && isset($data->is_active)) {
            $query = "UPDATE users SET is_active = :status WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':status' => $data->is_active ? 1 : 0, ':id' => $data->user_id]);
        }

        echo json_encode(["message" => "User updated successfully."]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Update failed", "error" => $e->getMessage()]);
    }
}
?>
