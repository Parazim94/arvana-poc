@AGENTS.md

# Arvana Candidate Onboarding PoC

## Project Overview
PoC for Arvana GmbH to automate candidate onboarding. 
Integrates Next.js, Supabase, n8n webhooks, and Vercel.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server/Client Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Backend & DB**: Supabase (PostgreSQL, Row Level Security enabled, Realtime)
- **Automation**: n8n Webhooks

## Key Files & Paths
- `src/app/page.tsx` - Main Dashboard UI (Candidate List & Form)
- `src/lib/supabase.ts` - Supabase Client Initialization
- `.env.local` - Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Guidelines for Claude Code
1. **Communication**: Explain technical decisions in German. Write code, comments, and Git commit messages in English.
2. **Code Style**:
   - Keep components clean and modular.
   - Use proper TypeScript typing (avoid `any`).
   - Do not touch `.env.local` directly unless instructed.
3. **Git Rules**:
   - Small, atomic commits with conventional commit messages (e.g., `feat:`, `fix:`, `refactor:`).
   - Verify changes before pushing.
4. **Commands**:
   - Dev Server: `npm run dev`
   - Build: `npm run build`
   - Lint: `npm run lint`