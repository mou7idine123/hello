# IHSAN Frontend - Interface Utilisateur de la Plateforme Humanitaire

Interface React moderne et responsive pour la plateforme IHSAN — un système de gestion des dons humanitaires avec traçabilité blockchain, preuves d'impact vérifiées, et scoring des validateurs de terrain.

## Technologies Utilisées

- **React 18** — Architecture composants et hooks
- **Vite** — Build ultra-rapide et serveur de développement HMR
- **Axios** — Requêtes API vers le backend PHP
- **React Router Dom** — Navigation et routes protégées par rôle
- **Lucide React** — Iconographie moderne et cohérente
- **i18next / react-i18next** — Internationalisation (FR/AR)
- **Recharts** — Graphiques et visualisations

## Structure de l'Application

L'application est divisée en **6 espaces** selon le rôle de l'utilisateur :

| Espace | Accès | Description |
|--------|-------|-------------|
| **Public** | Tout le monde | Accueil, catalogue des besoins, vitrine d'impact, vérificateur blockchain |
| **Donneur** | Rôle `donor` | Suivi des dons, preuves d'impact personnelles, tableau de bord |
| **Validateur** | Rôle `validator` | Création de besoins, confirmation de remises, score de réputation |
| **Partenaire** | Rôle `partner` | Commandes, paiements reçus, profil marchand |
| **Admin** | Rôle `admin` | Supervision globale, vérification des virements, gestion utilisateurs |
| **Impact Proof** | Public | Page de preuve d'impact partageable pour chaque don (aucune connexion requise) |

## Pages et Composants Clés

### Pages (src/pages/)
- `Auth.jsx` — Connexion / Inscription
- `DonorDashboard.jsx` — Dashboard donneur avec historique, impact personnel (familles aidées), et preuves
- `ImpactProof.jsx` — Page de preuve d'impact publique et partageable (`/impact/:donationId`)
- `ValidatorDashboard.jsx` — Dashboard validateur avec score de réputation
- `PartnerDashboard.jsx` — Commandes et paiements partenaire
- `AdminDashboard.jsx` — Supervision complète avec vérification des remises
- `NeedDetail.jsx` — Détail d'un besoin avec preuve d'impact si complété
- `CreateNeed.jsx` / `ConfirmDelivery.jsx` — Formulaires validateur

### Composants (src/components/)
- `NeedsCatalog.jsx` — Catalogue filtrable (défaut : besoins ouverts)
- `ImpactShowcase.jsx` — Vitrine des dernières remises effectuées (landing page)
- `Hero.jsx` — Section d'accroche principale
- `Dashboard.jsx` — Transparence financière et dons récents
- `ProtectedRoute.jsx` — Garde de route par rôle JWT
- `NotificationBell.jsx` — Notifications en temps réel

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement (http://localhost:5173)
npm run dev

# Générer la version de production
npm run build
```

> L'URL du backend est configurée par défaut sur `http://localhost:8000` via `src/api.js`.

## Fonctionnalités Récentes

- ✅ **Vitrine d'Impact Publique** — Section sur la page d'accueil montrant les remises effectuées avec photos et messages de terrain
- ✅ **Page Impact Proof Partageable** — Chaque don a une page publique détaillée (`/impact/:id`) accessible sans connexion
- ✅ **Score Validateur** — Système de réputation dynamique affiché sur les fiches besoins et le dashboard validateur  
- ✅ **Familles Aidées** — Compteur précis basé sur les besoins réellement complétés (global + personnel par donneur)
- ✅ **Message du Terrain** — Les validateurs laissent un message aux donneurs lors de la remise, visible sur la page impact
- ✅ **Historique Partenaire** — Les partenaires voient leurs paiements et commandes avec détails

## Scripts Disponibles

- `npm run dev` — Serveur de développement
- `npm run build` — Build de production dans `dist/`
- `npm run preview` — Prévisualisation du build
- `npm run lint` — Vérification ESLint

## Licence

[MIT](LICENSE)
