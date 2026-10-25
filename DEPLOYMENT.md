# NOIRÉ — Deployment & Run Guide

This project is built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **Framer Motion**, and **Prisma ORM**.

---

## 1. Quick Start (Local Development)

### Prerequisites
- Node.js 20+ (Node 20, 22, or 26)
- npm 10+

### Install Dependencies
```bash
npm install
```

### Generate Prisma Client & Sync Database
```bash
npx prisma generate
npx prisma db push
```

### Start Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 2. Production Build & Run (Standalone Node.js)

The project is preconfigured with Next.js `output: "standalone"`, making it extremely lightweight and production-ready.

```bash
# 1. Build the production bundle and copy static assets
npm run build

# 2. Run the production server
npm start
```
By default, the server runs on port 3000 (`http://localhost:3000`).
To change the port:
```bash
# Windows PowerShell
$env:PORT="8080"; npm start

# Linux / macOS
PORT=8080 npm start
```

---

## 3. Docker Deployment

A multi-stage, secure `Dockerfile` is provided in the root directory.

### Build the Docker Image
```bash
docker build -t noire-cafe:latest .
```

### Run the Docker Container
```bash
docker run -d -p 3000:3000 --name noire-cafe noire-cafe:latest
```
Access the application at `http://localhost:3000`.

---

## 4. Vercel Deployment (Recommended for Cloud)

Deploying to Vercel requires zero extra configuration:
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your repository.
4. Set Environment Variables if necessary (e.g. `DATABASE_URL`).
5. Click **Deploy**.

---

## 5. Other Cloud Providers (Railway, Render, Fly.io, Cloud Run)

### Render / Railway / Fly.io:
- Connect the Git repository.
- Select Docker or Node runtime.
- Build Command: `npm run build`
- Start Command: `npm start`
- Port: `3000`

---

## 6. Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev -p 3000` | Starts the Next.js Turbopack development server |
| `npm run build` | `next build && node scripts/copy-standalone.js` | Generates optimized production build & standalone assets |
| `npm start` | `node .next/standalone/server.js` | Launches the production standalone Node.js server |
| `npm run lint` | `eslint .` | Runs ESLint for code quality and standard compliance |
| `npm run db:generate` | `prisma generate` | Generates the Prisma Client TypeScript types |
| `npm run db:push` | `prisma db push --accept-data-loss` | Pushes the Prisma schema to the SQLite database |

---

## 7. Deep-Links & Features
- **Guest Site**: `http://localhost:3000`
- **Kitchen Display System (KDS)**: `http://localhost:3000/#kds`
- **Staff Sign-in Gate**: `http://localhost:3000/#staff` (Demo: `ava@noire.coffee` / `liam@noire.coffee` · `noire2026`)
- **Staff Portal**: `http://localhost:3000/#portal`
- **QR Table Ordering**: `http://localhost:3000/#table=7`
