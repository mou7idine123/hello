# IHSAN Frontend - Interface Utilisateur de la Plateforme de Don

Cette interface moderne et responsive permet aux donneurs, validateurs, partenaires et administrateurs d'interagir avec la plateforme IHSAN.

## Technologies Utilisées

- **React 18**: Bibliothèque JavaScript pour construire l'interface.
- **Vite**: Outil de build ultra-rapide.
- **Axios**: Pour les requêtes API vers le backend.
- **Lucide React**: Pour l'iconographie moderne.
- **Recharts**: Pour les graphiques et statistiques.
- **React Leaflet**: Pour la cartographie interactive.
- **React Router Dom**: Pour la navigation entre les espaces.

## Structure de l'Application

L'application est divisée en 5 espaces principaux :
1.  **Public**: Accueil, catalogue des besoins et vérificateur de dons (Blockchain).
2.  **Donneur**: Suivi des dons personnels et preuves d'impact.
3.  **Validateur**: Gestion des besoins sur le terrain et confirmation de remises.
4.  **Partenaire**: Gestion des commandes et paiements (Restaurants/Commerces).
5.  **Admin**: Supervision totale, validation des virements et gestion des utilisateurs.

## Installation

1.  **Installation des dépendances**:
    ```bash
    npm install
    ```
2.  **Lancement en mode développement**:
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:5173`.
3.  **Configuration API**:
    Vérifiez l'URL du backend dans vos configurations Axios (par défaut configuré pour `http://localhost:8000`).

## Scripts Disponibles

- `npm run dev`: Lance le serveur de développement.
- `npm run build`: Génère la version de production dans le dossier `dist/`.
- `npm run preview`: Prévisualise la version de production localement.
- `npm run lint`: Vérifie la qualité du code avec ESLint.

## Licence

[MIT](LICENSE)
