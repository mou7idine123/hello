<?php
require 'defi2_backend/config/Database.php';
$db = (new Database())->getConnection();
$users = [
    ['name' => 'donor2', 'email' => 'donor2@gmail.com', 'pass' => '123', 'role' => 'donor'],
    ['name' => 'Validateur Test', 'email' => 'giver@gmail.com', 'pass' => '123', 'role' => 'validator'],
    ['name' => 'Partenaire Test', 'email' => 'partner2@gmail.com', 'pass' => '123', 'role' => 'partner'],
    ['name' => 'Donateur Test', 'email' => 'donor@gmail.com', 'pass' => '123', 'role' => 'donor'],
    ['name' => 'Cuisine Centrale', 'email' => 'partner@gmail.com', 'pass' => '123', 'role' => 'partner'],
];

try {
    foreach ($users as $u) {
        $password = password_hash($u['pass'], PASSWORD_BCRYPT);
        
        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
        $stmt->execute([':email' => $u['email']]);
        
        if($stmt->rowCount() == 0) {
            $insert = $db->prepare("INSERT INTO users (full_name, email, password, role) VALUES (:name, :email, :pass, :role)");
            $insert->execute([
                ':name' => $u['name'],
                ':email' => $u['email'],
                ':pass' => $password,
                ':role' => $u['role']
            ]);
            echo "Utilisateur '{$u['name']}' ({$u['role']}) créé avec succès.\n";
        } else {
            $update = $db->prepare("UPDATE users SET full_name = :name, role = :role, password = :pass WHERE email = :email");
            $update->execute([
                ':name' => $u['name'],
                ':role' => $u['role'],
                ':pass' => $password,
                ':email' => $u['email']
            ]);
            echo "Utilisateur '{$u['name']}' ({$u['role']}) mis à jour.\n";
        }
    }
} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
