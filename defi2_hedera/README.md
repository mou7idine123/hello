# IHSAN Hedera Microservice

Ce service Node.js sert de passerelle entre l'API PHP et le réseau **Hedera Hashgraph**. Il gère la signature des transactions et l'envoi de messages sur le **Hedera Consensus Service (HCS)**.

## 🛠️ Stack Technique

- **Node.js**
- **Express**
- **@hashgraph/sdk** — SDK officiel de Hedera
- **dotenv** — Gestion des variables d'environnement

## ⚙️ Configuration

Créez un fichier `.env` à la racine de ce dossier :

```env
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=303002010...
HEDERA_TOPIC_ID=0.0.yyyyy
```

- **HEDERA_ACCOUNT_ID** : Votre compte Testnet (à créer sur [portal.hedera.com](https://portal.hedera.com)).
- **HEDERA_PRIVATE_KEY** : Votre clé privée formatée en hexadécimal.
- **HEDERA_TOPIC_ID** : L'ID du topic HCS créé pour le projet (utilisez `createTopic.js` si vous n'en avez pas encore).

## 🚀 Utilisation

### Installation
```bash
npm install
```

### Lancement
```bash
node server.js
```
Le serveur tourne par défaut sur le port **3000**.

## 🔌 API

### `POST /api/log-impact`
Envoie un message JSON immuable sur le Topic HCS.

**Payload :**
```json
{
  "event": "DONATION_VERIFIED",
  "donation_id": 123,
  "amount": 1500,
  "timestamp": "2026-03-07T..."
}
```

**Réponse :**
```json
{
  "success": true,
  "transactionId": "0.0.xxx@yyy.zzz",
  "sequenceNumber": "42",
  "explorerUrl": "https://hashscan.io/testnet/transaction/..."
}
```

## 🛠️ Utilitaires
- `node createTopic.js` : Crée un nouveau Topic de transparence sur le réseau et affiche son ID.
- `node test_donations.js` : Simule un envoi de don pour tester la connectivité.

---
Partie intégrante de la plateforme **IHSAN — Blockchain for Good**.
