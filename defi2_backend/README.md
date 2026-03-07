# IHSAN Backend - API de la Plateforme de Don Humanitaire

API PHP qui gère la logique métier, l'accès à la base de données et l'intégration blockchain pour la plateforme IHSAN — une plateforme de dons transparente basée sur la blockchain Hedera Hashgraph.

## Technologies Utilisées

- **PHP 8.x** — Logique métier et endpoints REST
- **MySQL** — Stockage des données relationnelles
- **JWT (JSON Web Tokens)** — Authentification sécurisée par rôles
- **Hedera Hashgraph** — Ancrage immuable des preuves de don sur la blockchain
- **PDO** — Accès sécurisé à la base de données
- **CORS Centralisé** — Contrôle des origines autorisées (`config/cors.php`)

## Structure du Projet

```text
defi2_backend/
├── api/
│   ├── admin/                    # Endpoints administrateurs
│   │   ├── dashboard_stats.php   # Statistiques globales
│   │   ├── donations.php         # Gestion et vérification des dons (+ Hedera TX ID)
│   │   ├── needs.php             # Gestion des besoins (annulation, etc.)
│   │   ├── remise_verification.php # Vérification des remises (+ scoring + HCS)
│   │   └── users.php             # Gestion des utilisateurs et rôles
│   ├── validator/
│   │   ├── confirm_delivery.php  # Soumission de preuve de remise
│   │   ├── dashboard.php         # Dashboard + score validateur
│   │   └── needs.php             # Création de besoins (+ scoring)
│   ├── create_donation.php       # Soumission d'un don
│   ├── get_donation.php          # Détails complets pour la page Impact Proof (HashScan links)
│   ├── impact_needs.php          # Besoins complétés pour la vitrine d'impact publique
│   ├── needs.php                 # Catalogue des besoins (public)
│   ├── partner_orders.php        # Gestion des commandes partenaires
│   ├── partner_payments.php      # Historique des paiements partenaires
│   ├── partner_profile.php       # Profil et setup du partenaire (+ location)
│   ├── public_partners.php       # Liste publique des partenaires (Landing Page)
│   ├── public_validators.php     # Liste publique des validateurs (Landing Page)
│   ├── public_stats.php          # Statistiques publiques de la plateforme (Collected sum)
│   ├── stats.php                 # Statistiques enrichies (familles aidées, etc.)
│   ├── user_donations.php        # Historique des dons d'un donneur
│   └── ...
├── config/
│   ├── cors.php                  # Configuration CORS
│   ├── Database.php              # Connexion PDO
│   ├── AuthMiddleware.php        # Vérification JWT
│   └── JwtHandler.php            # Génération/validation des tokens
├── defi2_hedera/                 # Microservice Node.js pour intégration Hedera
│   ├── server.js                 # API Express pour signer et soumettre via @hashgraph/sdk
│   ├── createTopic.js            # Script utilitaire pour créer un topic sur le réseau
│   └── .env                      # Clés privées et Topic ID
└── ihsan_platform.sql            # Schéma complet de la base de données
```

## Configuration et Installation

1. **Prérequis** : PHP 8.x, serveur MySQL, serveur web (Apache/Nginx ou PHP built-in).
2. **Base de données** : Importez `ihsan_platform.sql` dans votre MySQL.
3. **Configuration** : Renseignez les accès DB dans `config/Database.php`.
4. **CORS** : Autorize les origines dans `config/cors.php` (par défaut `http://localhost:5173`).
5. **Lancement local** :
   ```bash
   php -S localhost:8000
   ```

## Endpoints Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/login.php` | Connexion et génération du token JWT |
| `POST` | `/api/register.php` | Inscription (donneurs) |
| `GET` | `/api/needs.php` | Catalogue des besoins (public) |
| `POST` | `/api/create_donation.php` | Soumission d'un don |
| `GET` | `/api/get_donation.php?id=X` | Détails complets d'un don (page Impact Proof publique) |
| `GET` | `/api/impact_needs.php` | Besoins complétés avec preuves (vitrine publique) |
| `GET` | `/api/user_donations.php` | Dons d'un donneur (JWT requis) |
| `GET` | `/api/stats.php` | Statistiques dynamiques (familles aidées, MRU collectés) |
| `GET` | `/api/public_validators.php` | Liste des validateurs terrains (Public) |
| `GET` | `/api/public_partners.php` | Liste des boutiques et cuisines partenaires (Public) |
| `POST` | `/api/validator/confirm_delivery.php` | Soumission de preuve de remise + message donneur |
| `GET/POST` | `/api/partner_orders.php` | Commandes partenaires |
| `POST` | `/api/admin/remise_verification.php` | Vérification admin + mise à jour score + ancrage HCS |

## Système de Score Validateur

Chaque validateur commence avec **20 points**. Le score évolue selon :

| Événement | Points |
|-----------|--------|
| Création d'un besoin | +5 pts |
| Remise confirmée par photo | +10 pts |
| Besoin annulé ou remise refusée | -5 pts |
| Remise > 24h après heure prévue | -2 pts |

## Intégration Hedera (Microservice Node.js)

Bien que l'API principale soit en PHP, l'interaction cryptographique avec la blockchain Hedera Hashgraph (signatures Ed25519, HCS) est externalisée via un microservice Node.js léger situé dans `defi2_hedera`.

### Déploiement du Microservice
1. Activer le dossier : `cd defi2_hedera`
2. Installer le SDK : `npm install`
3. Configurer les clés dans `.env` :
   ```env
   HEDERA_ACCOUNT_ID=0.0.xxxxx
   HEDERA_PRIVATE_KEY=votre_cle_privee
   HEDERA_TOPIC_ID=0.0.yyyyy
   ```
4. Lancer le service : `node server.js` (tourne par défaut sur le port 3000)

Le projet utilise le **Hedera Testnet** pour l'ancrage des preuves. L'API PHP communique en interne avec ce service pour :
1. **Ancrer les dons** : Chaque virement vérifié génère une transaction sur le réseau.
2. **Ancrer les remises** : Chaque livraison confirmée est envoyée sur un Topic HCS (`0.0.8113854`).

Le système stocke à la fois le **Transaction ID** (pour l'explorateur HashScan) et le **Sequence Number** (pour le contenu du message) afin de garantir une transparence totale.

## Licence

[MIT](LICENSE)