# Recepty

A personal cookbook web app in Slovak. It's built for use in the kitchen and at the store: it runs on a phone, installs as an app and keeps working offline.

> **Note:** All of the code in this repository was written by AI (Claude). None of it was written by hand.

## App

- **Installable PWA** that works offline. The app, the recipe index and every recipe are precached. Images are cached once they've been viewed.
- Light and dark theme, following the system setting.

## Tech stack

React 19, React Router 7, TypeScript, Vite with `vite-plugin-pwa`, and `lucide-react` icons. There's no backend: recipes are static JSON files, and the shopping list lives in `localStorage`.

## Development

```sh
npm install
npm run dev          # dev server
npm run build:index  # rebuild public/recipes.json after adding or editing recipes
npm run build        # index + typecheck + production build into dist/
npm run lint
```

The app is served under `/cookbook/`; `base` in [vite.config.ts](vite.config.ts) sets this.

### Adding a recipe

1. Use [prompts/import-recipe.md](prompts/import-recipe.md) with an AI assistant to convert a recipe web page to JSON.
2. Save the result as `public/recipes/<id>.json` (`<id>` is a random 20-character alphanumeric id) and add any new categories, units or ingredients to the matching file in `public/enums/`.
3. Put the image in `public/images/`.
4. Run `npm run build:index`. It rebuilds the index and re-encodes images over 100 KB as JPEG. Image optimization uses PowerShell `System.Drawing`, so it needs Windows.

## Deployment

Every push to `main` builds the app and deploys it to GitHub Pages; the workflow is in [.github/workflows/deploy.yml](.github/workflows/deploy.yml). The build copies `index.html` to `404.html` so that client-side routes work when a page is opened directly.
