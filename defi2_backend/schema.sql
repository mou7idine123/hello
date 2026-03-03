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
    role ENUM('donor', 'partner', 'validator', 'admin') DEFAULT 'donor',
    is_active BOOLEAN DEFAULT TRUE,
    reputation_score INT DEFAULT 0,
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
    deadline_date DATETIME,
    status ENUM('Open', 'Funded', 'In progress', 'Confirmed', 'Cancelled') DEFAULT 'Open',
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
    status ENUM('En attente de virement', 'Reçu soumis', 'Vérifié', 'Remis', 'Rejeté') DEFAULT 'En attente de virement',
    is_anonymous BOOLEAN DEFAULT FALSE,
    receipt_path VARCHAR(255),
    admin_note TEXT,
    rejection_reason TEXT,
    delivery_photo_path VARCHAR(255),
    delivery_message TEXT,
    gps_coordinates VARCHAR(100),
    hedera_sequence VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (need_id) REFERENCES needs(id)
);

-- Partners (Restaurants, Commerces)
CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    address TEXT,
    specialties VARCHAR(255),
    opening_hours VARCHAR(255),
    photo_path VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_name VARCHAR(100),
    bank_account_holder VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Partner Orders
CREATE TABLE IF NOT EXISTS partner_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    donation_id INT,
    item_type VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    scheduled_time DATETIME,
    status ENUM('À préparer', 'En préparation', 'Prête', 'Remise') DEFAULT 'À préparer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE SET NULL
);

-- Partner Payments
CREATE TABLE IF NOT EXISTS partner_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partner_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_ref VARCHAR(100),
    status ENUM('En attente', 'Payé') DEFAULT 'En attente',
    payment_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Admin & Configuration Tables
CREATE TABLE IF NOT EXISTS platform_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bank_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    related_id INT,
    related_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mock data for needs
INSERT INTO needs (type, district, description, full_description, required_mru, collected_mru, validator_name, beneficiaries, status) VALUES
('Panier alimentaire', 'Tevragh Zeina', 'Aide alimentaire pour le Ramadan', 'Fourniture de kits alimentaires complets pour les familles nécessiteuses comprenant du riz, de l\'huile, du sucre et des dattes.', 50000, 15000, 'Association IHSAN', 10, 'Open'),
('Santé', 'El Mina', 'Soins médicaux urgents', 'Prise en charge des frais d\'hospitalisation et des médicaments pour une patiente nécessitant une chirurgie urgente.', 25000, 5000, 'Dr. Ahmed', 1, 'Open'),
('Éducation', 'Dar Naim', 'Kits scolaires pour orphelins', 'Distribution de fournitures scolaires et de sacs à dos pour 50 enfants orphelins pour la rentrée scolaire.', 15000, 15000, 'ONG Espoir', 50, 'Funded');
