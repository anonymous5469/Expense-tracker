# FinTrack

FinTrack is a responsive, offline-first expense tracker with automatic balance calculations and optional Gemini financial guidance.

## Features

- Monthly budget, total spent, and remaining balance update immediately.
- Add, edit, delete, undo, search, filter, and export transactions as CSV.
- Category breakdown and 14-day spending trend charts.
- Light and dark themes with persisted preferences.
- Optional Gemini summaries, model selection, and budget chat.
- Responsive layout for desktop, tablet, and mobile.

## Local Development

Requirements: Node.js 18 or newer and npm.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

The production build is written to `dist/` and is intentionally ignored by Git.

## Gemini Setup

Gemini is optional. Open **Admin Centre** in the app, paste a key from [Google AI Studio](https://aistudio.google.com/app/apikey), and select **Save**.

The key and expense data are stored in the browser's local storage. The key is sent directly from the browser to Google's API when AI features are used. There is no FinTrack backend and no Gemini server secret to configure. Never commit an API key or place one in a tracked file.

Because storage is browser-local, data does not automatically sync between browsers or devices. A deployed URL makes the app available everywhere, but each browser has its own data unless cloud sync is added later.

## Deployment

FinTrack is a static Vite app. The default deployment settings are:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### Vercel

Import the GitHub repository into Vercel. Vercel detects Vite automatically and deploys every push to the configured branch.

### Netlify

Import the repository into Netlify with the build command and output directory above. The included Vite entry point is suitable for this single-page app.

### GitHub

Keep `package-lock.json` committed and do not commit `node_modules/`, `dist/`, `.env`, or `.env.*`. The included `.nvmrc` and `engines` field document the supported Node baseline.

## Project Structure

- `src/App.tsx` - application shell, theme, totals, and dialogs.
- `src/components/` - dashboard, forms, charts, tables, and Admin Centre.
- `src/store/useExpenseStore.ts` - persisted client-side state.
- `src/lib/gemini.ts` - Gemini model discovery, requests, and response sanitization.
- `vite.config.ts` - Vite alias and production chunk configuration.
