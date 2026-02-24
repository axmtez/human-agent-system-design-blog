# human-agent-system-design-blog

## Setup

```bash
npm install
```

## Dev

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Check

```bash
npm run check
```

Deploy the `dist` output to Vercel (default Astro adapter; no config required).

## Docker

Everything runs inside Docker (Node 20). Use either dev (live reload) or production (built site).

**Production (build + preview):**

```bash
docker build -t blog .
docker run -p 4321:4321 blog
```

Or with Compose:

```bash
docker compose up prod
```

Open http://localhost:4321

**Development (live reload):**

```bash
docker compose up dev
```

Source is mounted so edits apply immediately. Open http://localhost:4321
