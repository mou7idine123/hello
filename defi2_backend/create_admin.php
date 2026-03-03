<?php
require 'config/Database.php';
$db = (new Database())->getConnection();
$password = password_hash('admin', PASSWORD_BCRYPT);
try {
    $stmt = $db->prepare("SELECT id FROM users WHERE email = 'admin@admin.admin'");
    $stmt->execute();
    if($stmt->rowCount() == 0) {
        $insert = $db->prepare("INSERT INTO users (full_name, email, password, role) VALUES ('Admin System', 'admin@admin.admin', :pass, 'admin')");
        $insert->execute([':pass' => $password]);
        echo "Compte admin créé avec succès.\n";
    } else {
        $update = $db->prepare("UPDATE users SET role='admin', password=:pass WHERE email='admin@admin.admin'");
        $update->execute([':pass' => $password]);
        echo "Compte admin mis à jour avec le mot de passe 'admin'.\n";
    }
} catch(PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
