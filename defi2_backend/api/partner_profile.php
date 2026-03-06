<?php
require_once __DIR__ . '/../config/cors.php';if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/Database.php';

$database = new Database();
$db = $database->getConnection();

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;

if (!$user_id) {
    // If it's a POST, check body for user_id
    $data = json_decode(file_get_contents("php://input"));
    $user_id = isset($data->user_id) ? $data->user_id : null;
}

if (!$user_id) {
    http_response_code(400);
    echo json_encode(["message" => "Missing user_id parameter."]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch profile
    $query = "SELECT * FROM partners WHERE user_id = :user_id LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $partner = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($partner);
    } else {
        echo json_encode(null); // No profile yet
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update or Create profile
    $data = json_decode(file_get_contents("php://input"));
    
    // Check if exists
    $checkQuery = "SELECT id FROM partners WHERE user_id = :user_id";
    $stmtCheck = $db->prepare($checkQuery);
    $stmtCheck->bindParam(':user_id', $user_id);
    $stmtCheck->execute();
    
    $business_name = $data->business_name ?? '';
    $address = $data->address ?? '';
    $specialties = $data->specialties ?? '';
    $opening_hours = $data->opening_hours ?? '';
    $bank_account_number = $data->bank_account_number ?? '';
    $bank_name = $data->bank_name ?? '';
    $bank_account_holder = $data->bank_account_holder ?? '';
    
    if ($stmtCheck->rowCount() > 0) {
        // Update
        $query = "UPDATE partners SET 
                  business_name = :bn, 
                  address = :addr, 
                  specialties = :spec, 
                  opening_hours = :oh, 
                  bank_account_number = :ban, 
                  bank_name = :bname, 
                  bank_account_holder = :bah
                  WHERE user_id = :user_id";
    } else {
        // Create
        $query = "INSERT INTO partners (user_id, business_name, address, specialties, opening_hours, bank_account_number, bank_name, bank_account_holder)
                  VALUES (:user_id, :bn, :addr, :spec, :oh, :ban, :bname, :bah)";
    }
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':bn', $business_name);
    $stmt->bindParam(':addr', $address);
    $stmt->bindParam(':spec', $specialties);
    $stmt->bindParam(':oh', $opening_hours);
    $stmt->bindParam(':ban', $bank_account_number);
    $stmt->bindParam(':bname', $bank_name);
    $stmt->bindParam(':bah', $bank_account_holder);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Profile saved successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error saving profile."]);
    }
}
?>
