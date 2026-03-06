# IHSAN Backend - API de la Plateforme de Don

Cette partie du projet contient l'API PHP qui gère la logique métier, l'accès à la base de données et l'intégration avec la blockchain Hedera pour la plateforme IHSAN.

## Technologies Utilisées

- **PHP 8.x**: Langage de script côté serveur.
- **MySQL**: Base de données relationnelle.
- **JWT (JSON Web Tokens)**: Pour l'authentification sécurisée.
- **Hedera Hashgraph (SDK PHP)**: Pour l'ancrage des preuves sur la blockchain.
- **CORS Centralisé**: Gestion sécurisée des origines autorisées.

## Structure du Projet

```text
defi2_backend/
├── api/                # Points de terminaison (endpoints) de l'API
│   ├── admin/         # Endpoints réservés aux administrateurs
│   ├── validator/     # Endpoints réservés aux validateurs
│   └── ...           # Endpoints publics et pour les donneurs
├── config/             # Configuration de la base de données, JWT et CORS
├── logs/               # Journaux d'activité (si configurés)
└── ...
```

## Configuration et Installation

1.  **Prérequis**:
    - Serveur Web (Apache/Nginx) avec PHP 7.4 ou supérieur.
    - Serveur MySQL.
2.  **Base de données**:
    - Importez le fichier `ihsan_platform.sql` situé à la racine du projet dans votre serveur MySQL.
    - Configurez les accès dans `config/Database.php`.
3.  **CORS**:
    - La configuration CORS se trouve dans `config/cors.php`. Par défaut, elle autorise `http://localhost:5173` (Vite).
4.  **Authentification**:
    - La plateforme utilise des tokens JWT. La configuration se trouve dans `config/JwtHandler.php`.

## Endpoints Principaux

- `POST /api/login.php`: Connexion utilisateur.
- `POST /api/register.php`: Inscription (donneurs).
- `GET /api/needs.php`: Liste des besoins publics.
- `POST /api/create_donation.php`: Soumission d'un don par un donneur.
- `POST /api/validator/confirm_delivery.php`: Confirmation de remise par un validateur.

## Licence

[MIT](LICENSE)