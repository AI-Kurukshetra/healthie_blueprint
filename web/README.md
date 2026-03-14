# CareSync Web

This Next.js application provides the operator-facing dashboard for CareSync. It pairs with the Supabase MCP Edge Function so you can orchestrate workflows between agents and humans.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Populate the file with your Supabase project URL and public anon key for client-side use.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser to see the dashboard shell.

## Scripts
- `npm run dev` – Start the Next.js dev server
- `npm run build` – Create an optimized production build
- `npm run start` – Run the production build locally
- `npm run lint` – Lint the project with ESLint + Next.js rules

## Tailwind CSS
Tailwind is configured via `tailwind.config.ts` and `postcss.config.js`. Global styles live in `src/app/globals.css`.

## Project Structure
```
web/
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── public/
├── package.json
└── tailwind.config.ts
```
Extend routes under `src/app` and create shared UI in `src/components` as the product evolves.
