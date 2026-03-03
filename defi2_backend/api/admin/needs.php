<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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
    try {
        $query = "SELECT * FROM needs ORDER BY created_at DESC";
        $stmt = $db->query($query);
        $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($needs);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["message" => "Error fetching needs", "error" => $e->getMessage()]);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Edit or Cancel need
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->need_id) || !isset($data->action)) {
        http_response_code(400);
        echo json_encode(["message" => "Missing parameters"]);
        exit;
    }

    try {
        if ($data->action === 'cancel') {
            // Check if it has funds
            $chkQuery = "SELECT collected_mru, required_mru FROM needs WHERE id = :id";
            $sChk = $db->prepare($chkQuery);
            $sChk->execute([':id' => $data->need_id]);
            $need = $sChk->fetch(PDO::FETCH_ASSOC);

            // Change status to Cancelled
            $query = "UPDATE needs SET status = 'Cancelled' WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([':id' => $data->need_id]);

            if ($need && $need['collected_mru'] > 0) {
                // Trigger Refund Logic: Notify all donors that they will be refunded
                $donorsQ = "SELECT DISTINCT user_id FROM donations WHERE need_id = :id AND user_id IS NOT NULL";
                $donorsS = $db->prepare($donorsQ);
                $donorsS->execute([':id' => $data->need_id]);
                while ($u = $donorsS->fetch(PDO::FETCH_ASSOC)) {
                    $nQ = "INSERT INTO notifications (user_id, title, message, type) VALUES (:uid, 'Besoin Annulé - Remboursement', 'Le besoin que vous avez soutenu a été annulé. L\'équipe IHSAN vous contactera pour le remboursement de votre don.', 'warning')";
                    $nS = $db->prepare($nQ);
                    $nS->execute([':uid' => $u['user_id']]);
                }
            }

            echo json_encode(["message" => "Besoin annulé avec succès."]);
        } else if ($data->action === 'edit') {
            $query = "UPDATE needs SET 
                      type = :t, district = :d, description = :desc, 
                      required_mru = :req, beneficiaries = :b 
                      WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':t' => $data->type,
                ':d' => $data->district,
                ':desc' => $data->description,
                ':req' => $data->required_mru,
                ':b' => $data->beneficiaries,
                ':id' => $data->need_id
            ]);
            echo json_encode(["message" => "Need updated successfully."]);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(["message" => "Update failed", "error" => $e->getMessage()]);
    }
}
?>
