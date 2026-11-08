# AGENTS.md: Sovren cleaning bid estimator

Instructions for AI coding agents (Claude Code, Codex, Cursor) working in this repo.

## What this is
A free, single-page tool that prices a commercial cleaning contract from task-level labor hours.
It's Sovren's Project 01. The story behind it lives on the main site at
https://sovrenservices.com/work/cleaning-bid-estimator. This repo is public, so never commit secrets.

## Stack
- Next.js (App Router) + TypeScript (strict), Tailwind CSS v4, Poppins via `next/font/google`.
- Deployed on Vercel at cleaningbidestimator.vercel.app. Push to `main` = production.
- No backend, database or analytics today. Everything runs in the browser.

## Rules
1. All math lives in `src/lib/estimator.ts` as pure functions, covered by `src/lib/estimator.test.ts`.
   Change the math, update the tests.
2. All user-facing copy lives in `src/content.ts`. Components don't hard-code text.
3. Colors and type come from the Sovren Design System tokens in `src/app/globals.css`. No stray hex codes in components.
4. Default production rates are Sovren starting assumptions, not industry standards. Say so wherever they appear.
5. Accessible by default: labeled inputs, 44px touch targets, 4.5:1 contrast, visible focus. Check 375px width.
6. Before finishing: `npm run lint && npm test && npm run build`.

## Voice (all copy)
Write like a direct, clear-headed person. Concise, practical, unpretentious.
- Never use em dashes, "It's not just X, it's Y" or "Not only... but also" structures, or forced lists of three.
- Never use: delve, leverage, testament, beacon, tapestry, game-changer, robust, realm, foster, landscape, navigate.
- Use contractions. Vary sentence length. Start on the point. Take a clear position.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
