-- Database schema for Ihsan Platform

CREATE DATABASE IF NOT EXISTS ihsan_platform;
USE ihsan_platform;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Needs table (provided for completeness)
CREATE TABLE IF NOT EXISTS needs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    description TEXT,
    full_description TEXT,
    required_mru DECIMAL(10, 2) NOT NULL,
    collected_mru DECIMAL(10, 2) DEFAULT 0,
    validator_name VARCHAR(255),
    beneficiaries INT,
    status ENUM('Open', 'Funded') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    need_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    tracking_id VARCHAR(20) NOT NULL UNIQUE,
    bank_reference VARCHAR(50),
    selected_bank VARCHAR(100),
    status ENUM('En attente de virement', 'Reçu soumis', 'Vérifié', 'Remis') DEFAULT 'En attente de virement',
    is_anonymous BOOLEAN DEFAULT FALSE,
    receipt_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (need_id) REFERENCES needs(id)
);

-- Mock data for needs
INSERT INTO needs (type, district, description, full_description, required_mru, collected_mru, validator_name, beneficiaries, status) VALUES
('Panier alimentaire', 'Tevragh Zeina', 'Aide alimentaire pour le Ramadan', 'Fourniture de kits alimentaires complets pour les familles nécessiteuses comprenant du riz, de l\'huile, du sucre et des dattes.', 50000, 15000, 'Association IHSAN', 10, 'Open'),
('Santé', 'El Mina', 'Soins médicaux urgents', 'Prise en charge des frais d\'hospitalisation et des médicaments pour une patiente nécessitant une chirurgie urgente.', 25000, 5000, 'Dr. Ahmed', 1, 'Open'),
('Éducation', 'Dar Naim', 'Kits scolaires pour orphelins', 'Distribution de fournitures scolaires et de sacs à dos pour 50 enfants orphelins pour la rentrée scolaire.', 15000, 15000, 'ONG Espoir', 50, 'Funded');
