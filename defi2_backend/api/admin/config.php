<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
AuthMiddleware::checkRole(['admin']);

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = isset($_GET['type']) ? $_GET['type'] : 'all';

    try {
        $result = [];

        if ($type === 'all' || $type === 'settings') {
            $stmt = $db->query("SELECT * FROM platform_settings");
            $result['settings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($type === 'all' || $type === 'banks') {
            $stmt = $db->query("SELECT * FROM bank_accounts");
            $result['banks'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        if ($type === 'all' || $type === 'announcements') {
            $stmt = $db->query("SELECT * FROM announcements ORDER BY created_at DESC");
            $result['announcements'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode($result);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $action = $data->action ?? '';

    try {
        if ($action === 'save_setting') {
            $query = "INSERT INTO platform_settings (setting_key, setting_value) VALUES (:k, :v)
                      ON DUPLICATE KEY UPDATE setting_value = :v";
            $stmt = $db->prepare($query);
            $stmt->execute([':k' => $data->key, ':v' => $data->value]);
            echo json_encode(["message" => "Setting saved"]);

        } else if ($action === 'add_bank') {
            $query = "INSERT INTO bank_accounts (bank_name, account_number, account_holder) VALUES (:bn, :an, :ah)";
            $stmt = $db->prepare($query);
            $stmt->execute([':bn' => $data->bank_name, ':an' => $data->account_number, ':ah' => $data->account_holder]);
            echo json_encode(["message" => "Bank added"]);

        } else if ($action === 'toggle_bank') {
            $query = "UPDATE bank_accounts SET is_active = :s WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':s' => $data->is_active, ':id' => $data->id]);
            echo json_encode(["message" => "Bank status updated"]);

        } else if ($action === 'add_announcement') {
            $query = "INSERT INTO announcements (title, content) VALUES (:t, :c)";
            $stmt = $db->prepare($query);
            $stmt->execute([':t' => $data->title, ':c' => $data->content]);
            echo json_encode(["message" => "Announcement added"]);

        } else if ($action === 'toggle_announcement') {
            $query = "UPDATE announcements SET is_active = :s WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':s' => $data->is_active, ':id' => $data->id]);
            echo json_encode(["message" => "Announcement status updated"]);

        } else {
            http_response_code(400);
            echo json_encode(["message" => "Unknown action"]);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
    }
}
?>
