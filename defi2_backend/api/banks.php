<?php
// backend/api/banks.php
require_once '../config/Database.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($db === null) {
        throw new Exception("Database connection failed");
    }

    $query = "SELECT id, bank_name, account_number, account_holder FROM bank_accounts WHERE is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $banks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($banks);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Internal server error', 'error' => $e->getMessage()]);
}
?>
