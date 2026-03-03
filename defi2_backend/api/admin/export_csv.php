<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
AuthMiddleware::checkRole(['admin']);

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, type, district, required_mru, collected_mru, validator_name, beneficiaries, status, created_at FROM needs ORDER BY created_at DESC";
    $stmt = $db->query($query);
    $needs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Set headers to download CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="ihsan_needs_export_' . date('Y-m-d') . '.csv"');

    // Create a file pointer connected to the output stream
    $output = fopen('php://output', 'w');

    // Output the column headings
    fputcsv($output, array('ID', 'Type', 'Quartier', 'Fonds Requis (MRU)', 'Fonds Collectés (MRU)', 'Validateur', 'Bénéficiaires', 'Statut', 'Date de création'));

    foreach ($needs as $row) {
        fputcsv($output, $row);
    }
    
    fclose($output);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
}
?>
