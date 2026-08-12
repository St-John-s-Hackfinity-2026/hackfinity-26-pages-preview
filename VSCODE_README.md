# Hackfinity ’26 — VS Code Setup

## What is included

This source package contains the public registration site, role-protected organizer dashboard, database schema, Google Sheets Apps Script webhook integration, supplied logo files, tests, and the production build configuration. Automated email delivery is intentionally not included in this revision.

## Local prerequisites

Install a current Node.js LTS release, `pnpm`, and a MySQL-compatible database. The source is a React, Vite, Express, tRPC, and Drizzle project.

| Step | Command or action |
|---|---|
| Install dependencies | `pnpm install` |
| Configure local environment | Create `.env` with `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `VITE_APP_ID`, `OWNER_OPEN_ID`, and the related OAuth configuration used by your deployment. |
| Create database tables | `pnpm drizzle-kit generate` followed by `pnpm drizzle-kit migrate` after pointing `DATABASE_URL` to your local database. |
| Run locally | `pnpm dev` |
| Run tests | `pnpm test` |
| Create a production build | `pnpm build` |

## Brand assets

The exported package includes `client/public/assets/` with the St. John’s, TOOFAN, and HowNWhy logo files. The exported `Home.tsx` references these local files, so the page can be reviewed directly from VS Code without relying on the hosted project asset URLs.

## Google Sheets

The organizer can add or clear the Apps Script `/exec` URL at `/organizer`. Full deployment instructions and the matching Apps Script are in `GOOGLE_SHEETS_SETUP.md`.
