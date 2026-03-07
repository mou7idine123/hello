<?php
require_once __DIR__ . '/../../config/cors.php';
// Note: cors.php sets Content-Type to application/json, 
// which is overridden later in this file for CSV export.

require_once '../../config/Database.php';
require_once '../../config/AuthMiddleware.php';

// Validated by Role
AuthMiddleware::checkRole(['admin']);

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT n.id, n.type, n.district, n.required_mru, n.collected_mru, u.full_name as validator_name, n.beneficiaries, n.status, n.created_at 
              FROM needs n 
              LEFT JOIN users u ON n.validator_id = u.id 
              ORDER BY n.created_at DESC";
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
