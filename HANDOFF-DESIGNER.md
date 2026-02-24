# Handoff: Designer agent

You are taking over an **Astro blog** that is fully built but has **zero design applied**. Your job is to add visual design: typography, spacing, and color using the stubbed tokens. The markup and structure are finished; do not change HTML structure or add component libraries—only style what exists.

## Project context

- **Repo**: human-agent-system-design-blog (Astro + TypeScript + Tailwind, content collections).
- **Branch**: `dev`.
- **Deploy target**: Vercel (`npm run build` → deploy `dist`).

## What’s already there

- **Content**: Blog collection with schema `title`, `description`, `publishDate`, `tags`, `draft`. One sample post in `src/content/blog/sample-post.md`.
- **Routes**: Index at `/` (list of published posts by date); individual posts at `/[slug]` (e.g. `/sample-post`).
- **Layout**: `src/layouts/BaseLayout.astro` — semantic shell with `<header>`, `<main>`, `<footer>`. No styling.
- **Global CSS**: `src/styles/global.css` — Tailwind base/components/utilities plus `:root` with **design tokens already defined**: type scale (`--font-size-*`, `--line-height-*`), spacing scale (`--space-*`), and color tokens (`--color-*`), including dark mode. Refine these tokens rather than replacing them so the design stays consistent.
- **Pages**: `src/pages/index.astro` (blog list), `src/pages/[slug].astro` (single post). Semantic HTML only; no classes or inline styles.

## Your tasks

1. **Refine design tokens** in `src/styles/global.css`:
   - Type scale, spacing scale, and color tokens (including dark mode) are already defined in `:root`. Adjust values to match your vision.
   - Use these variables in your styles so the design stays consistent and easy to change later.

2. **Style the layout** (`BaseLayout.astro`):
   - Apply tokens to the page shell (header, main, footer). Add only the minimal classes or wrapper elements needed for your layout (e.g. max-width, padding). Keep the existing semantic elements.

3. **Style the index page** (`src/pages/index.astro`):
   - Blog list: title, list of posts (date + title link), any list styling. Use your spacing and type scale.

4. **Style the post page** (`src/pages/[slug].astro`):
   - Post header (title, date, tags) and the markdown body (headings, paragraphs, lists, links, code if needed). Use Tailwind and/or scoped CSS; prefer your design tokens over one-off values.

5. **Optional**: Add a simple favicon (e.g. in `public/`) and reference it in `BaseLayout.astro` if you want.

## Constraints

- **Do not** change the semantic HTML structure (e.g. don’t remove `<article>`, `<header>`, `<time>`, or replace them with divs for styling alone).
- **Do not** add component libraries, UI kits, or icon packages unless the user asks.
- **Do not** add analytics, tracking, or third-party scripts.
- **Do** keep everything responsive and accessible (focus states, contrast, etc.).
- **Do** use the design tokens you define so a future designer can tweak the system in one place.

## Files to focus on

- `src/styles/global.css` — tokens and any base element styles.
- `src/layouts/BaseLayout.astro` — layout and optional favicon.
- `src/pages/index.astro` — index list styling.
- `src/pages/[slug].astro` — post layout and markdown content styling.
- `tailwind.config.mjs` — only if you need to plug tokens into Tailwind (e.g. theme extension). Keep it minimal.

Run `npm install` then `npm run dev` to work locally. When done, the blog should look intentional and ready for content; the designer handoff is complete.
