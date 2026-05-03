# Roue de Tirage - Système Modulaire

## Structure

Le système est totalement modulaire. Chaque roue/jeu est dans son propre dossier.

### Fichiers Structure

```
/TIRAGE/
├── style.css              # CSS structurel uniquement (pas de couleurs/shadows)
├── index.html            # HTML générique
├── script.js             # Script de chargement dynamique
├── botw/
│   ├── roue.json         # Configuration de la roue
│   ├── styleBOTW.css     # Style spécifique au jeu
│   └── assets/           # Images PNG/SVG pour les options
```

## Ajouter une Nouvelle Roue

### 1. Créer la structure du dossier

```bash
mkdir -p /TIRAGE/nouveujeu/assets
```

### 2. Créer `roue.json`

```json
{
  "title": "Titre de la Roue",
  "hideTitle": false,
  "hideLabels": false,
  "autoSpin": false,
  "options": [
    {
      "label": "Option 1",
      "color": "#FF0000",
      "image": "option1.png"
    },
    {
      "label": "Option 2",
      "color": "#00FF00",
      "image": null
    }
  ]
}
```

### Options disponibles dans roue.json

- **title**: Titre affiché en haut (string)
- **icon**: Icône Lucide à afficher à côté du titre (optionnel, string, voir [lucide.dev](https://lucide.dev))
- **hideTitle**: Masquer complètement le titre et l'icône (boolean, défaut: false)
- **hideLabels**: Masquer les labels/texte des options (affiche uniquement les images) (boolean, défaut: false)
- **autoSpin**: Lancer la roue automatiquement au chargement (boolean, défaut: false)
- **options**: Tableau des options avec:
  - **label**: Texte affiché
  - **color**: Code couleur hex (#RRGGBB)
  - **image**: Nom du fichier image dans `assets/` (null si pas d'image)

L'interface n'affiche aucun bouton: on lance toujours la roue en cliquant directement dessus.

### 3. Créer `styleNOMJEU.css`

```css
/* Les variables CSS doivent être définies ici */
:root {
    --primary-color: #VOTRE_COULEUR;
    --primary-hover: #VOTRE_COULEUR_HOVER;
    --background: #FOND;
    --text-color: #TEXTE;
    --border-color: #BORDURE;
    --result-color: #RESULTAT;
    --disabled-bg: #DESACTIVE_BG;
    --disabled-text: #DESACTIVE_TEXTE;
}

/* Aucun padding/couleur ne doit être défini ailleurs dans style.css */
/* Tout le styling spécifique au jeu va ici */
```

### 4. Ajouter les images

Mettre les images PNG/SVG dans `/TIRAGE/nouveujeu/assets/`

## Accès

- URL par défaut: `https://guessr.bryan.ovh/TIRAGE/` → redirige vers `?v=BOTW`
- URL personnalisée: `https://guessr.bryan.ovh/TIRAGE/?v=NOUVEUJEU`

## Points Importants

- **style.css**: Uniquement structure (flex, grid, sizing, positioning)
- **styleFRAM.css**: Toutes les couleurs, shadows, fonts, etc.
- **Responsive**: Utilise des `clamp()`, `max-width`, et `aspect-ratio`
- **Images**: Support PNG et SVG dans `assets/`
- **Icônes**: Utilise les icônes de Lucide via `data-lucide`
- **Interaction**: on clique directement sur la roue, aucun bouton visible

## Roues Disponibles

- **BOTW**: Bénédiction de la Déesse (Cœur ou Endurance)
