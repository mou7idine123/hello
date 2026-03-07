# IHSAN Platform - Système de Don Humanitaire Transparent

IHSAN est une plateforme de don nouvelle génération qui utilise la **Blockchain Hedera Hashgraph** pour garantir une transparence totale et une traçabilité sans faille, du donateur jusqu'à la famille bénéficiaire.

## 🌟 Vision du Projet

Le projet repose sur la **Triple Preuve d'Impact** :
1. **Preuve Financière** : Chaque don est ancré cryptographiquement sur le réseau Hedera.
2. **Preuve de Terrain** : Les validateurs de confiance certifient la remise en main propre avec photo et message.
3. **Preuve Logistique** : Un réseau de partenaires locaux (boutiques, cuisines) assure la distribution des biens.

## 🏗️ Architecture du Monorepo

Le projet est structuré en trois composants principaux :

- **[Frontend (React)](./defi2_frotend/README.md)** : Interface utilisateur moderne, responsive et multilingue (FR/AR).
- **[Backend (PHP)](./defi2_backend/README.md)** : API REST gérant la logique métier, les rôles (Donneur, Validateur, Partenaire, Admin) et le scoring.
- **[Hedera Microservice (Node.js)](./defi2_hedera/README.md)** : Pont cryptographique avec le réseau Hedera Hashgraph (HCS).

---

## 🚀 Démarrage Rapide

### 1. Backend & Base de données
- Importez `ihsan_platform.sql` dans MySQL.
- Configurez `defi2_backend/config/Database.php`.
- Lancez l'API :
  ```bash
  cd defi2_backend
  php -S localhost:8000
  ```

### 2. Microservice Hedera
- Configurez `.env` dans `defi2_hedera` avec vos Account ID et Private Key Testnet.
- Lancez le service :
  ```bash
  cd defi2_hedera
  npm install
  node server.js
  ```

### 3. Frontend
- Lancez l'interface :
  ```bash
  cd defi2_frotend
  npm install
  npm run dev
  ```
- Accédez à `http://localhost:5173`.

---

## 🔑 Fonctionnalités Majeures

- **Ancrage Blockchain** : Utilisation de Hedera Consensus Service (HCS) pour des preuves immuables.
- **Score de Réputation** : Système de points dynamique pour les validateurs de terrain.
- **Réseau de Confiance** : Vitrine publique des boutiques et partenaires locaux avec géolocalisation.
- **Explorateur HashScan** : Liens directs vers la blockchain pour chaque transaction.
- **Multi-Rôles** : Dashboards personnalisés pour chaque acteur de la chaîne humanitaire.

## 🛡️ Transparence & Audit
Chaque don génère un lien de vérification public pointant vers **HashScan**, permettant à n'importe qui de vérifier l'existence de la transaction et le message de remise sans compromettre l'anonymat des bénéficiaires.

---
© 2026 IHSAN Platform - Technologie au service de l'humain.
