<?php
// backend/config/Database.php

class Database {
    // Identifiants de la base de données
    private $host = "localhost";
    private $db_name = "ihsan_platform"; // Nom de la base de données attendu
    private $username = "root"; // Nom d'utilisateur attendu
    private $password = "root"; // Mot de passe attendu
    public $conn;

    // Obtenir la connexion à la base de données
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // Les erreurs de connexion seront réduites au silence nativement pour éviter la rupture du frontend 
            // si les coéquipiers n'ont pas encore initialisé la base de données avec succès.
        }

        return $this->conn;
    }
}
?>
