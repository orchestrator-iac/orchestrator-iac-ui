# Landing Zone Orchestrator UI

React + TypeScript frontend for the landing zone orchestrator. The app combines resource forms, graph-driven infrastructure editing, authentication, and the note-taking flows used for collaboration and documentation.

## What It Does

- Guides users through cloud infrastructure configuration.
- Sends form and graph changes to the FastAPI backend.
- Supports JWT-based authentication and token refresh.
- Includes the notes experience built with TipTap and fuzzy search.
- Generates static pages during production builds for deployment on GitHub Pages.

## Local Development

1. Install dependencies:

```powershell
npm install
```

2. Start the Vite dev server:

```powershell
npm run dev
```

3. Build for production:

```powershell
npm run build
```

4. Preview the production build locally:

```powershell
npm run preview
```

5. Run linting:

```powershell
npm run lint
```

## Environment Variables

- `VITE_API_BASE_URL`: backend base URL used by the API client and auth refresh/logout calls.
- `VITE_GOOGLE_CLIENT_ID`: optional Google OAuth client ID used by the login flow.

## Build And Deploy

- `npm run build` runs Vite and then `scripts/generate-static-pages.mjs` to inject route-specific metadata into the generated pages.
- `npm run deploy` publishes the `dist` directory to GitHub Pages.
- The production homepage is configured for `https://orchestrator.next-zen.dev`.

## Notes System

The notes UI uses TipTap for rich text editing, Fuse.js for search, and per-user persistence through the backend API. The backend is expected to provide note CRUD endpoints under `/api/notes`.

## Related Backend Expectations

The UI expects the backend to expose the authentication and orchestration APIs consumed by the app, including login, refresh, logout, and resource/template routes.

## Roadmap

- Improve the resource editing flow with stronger validation and clearer inline feedback.
- Expand graph-driven infrastructure authoring with more reusable building blocks.
- Continue tightening mobile responsiveness and accessibility across the main flows.
- Add richer deployment status and audit visibility as backend capabilities land.
