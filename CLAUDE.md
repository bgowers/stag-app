# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stag Points App** — A real-time points tracking web app for stag do challenges.

- Host creates a game with players and challenges (full CRUD)
- Players claim challenge points (base + bonus) via any device
- Live scoreboard and activity feed with Supabase Realtime
- No authentication system — uses localStorage for player identity per device

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** for styling
- **Supabase** (Postgres + Realtime) via `@supabase/supabase-js`
- **react-hot-toast** for notifications
- **canvas-confetti** for celebratory effects
- **lucide-react** for icons

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type checking
npm run typecheck
# or
tsc -p .

# Linting
npm run lint

# Tests
npm test

# Build for production
npm run build
```

## Architecture

### Route Structure

- `/` — Home page (create game flow)
- `/g/[gameId]` — Player view (challenges, scoreboard, activity feed)
- `/g/[gameId]/host` — Host view (manage players and challenges)

### Player Identity Pattern

**No traditional authentication.** Instead:

- Anyone with the game link can view and participate
- Each device selects a player identity from the game's player list
- Player ID stored in localStorage (`stagApp_playerId_[gameId]`)
- On `/g/[gameId]`, if no saved player: show PlayerPicker component
- Once selected, device "becomes" that player for all claims

### Database Schema (Supabase)

Four core tables:

```sql
games(id, name, status, created_at)

players(id, game_id, name, created_at)
  UNIQUE(game_id, name)

challenges(id, game_id, title, description, base_points, bonus_points,
           category, is_active, sort_order, created_at, updated_at)

events(id, game_id, player_id, challenge_id, kind, points,
       created_by_player_id, created_at)
  kind IN ('base', 'bonus')
  UNIQUE(player_id, challenge_id, kind)  ← Enforces one claim per type
```

**Key constraint:** The unique index on `(player_id, challenge_id, kind)` ensures:

- Each player can claim base points **once**
- Each player can claim bonus points **once**
- Database-level enforcement (not just UI)

### Supabase Integration

- Client initialized in `lib/supabase.ts`
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- Row-level security policies should allow public read/write (since no auth)

### Realtime Strategy

- Subscribe to Postgres changes on `events` table filtered by `game_id`
- On insert/update/delete: refetch events list
- Simple refetch approach (not optimistic UI) — sufficient for small groups
- Multiple devices show live updates within ~100ms

### Claiming Flow

1. Player taps "Claim +X" or "Bonus +Y" button
2. Insert into `events` table with `kind='base'` or `kind='bonus'`
3. If unique constraint violated:
   - Supabase returns error code `23505`
   - Show toast: "Already claimed"
4. On success:
   - Show success toast
   - If points >= 5: trigger confetti effect
   - Realtime subscription updates all connected clients

### Scoreboard Calculation

- Aggregate `events.points` grouped by `player_id`
- Sort descending by total
- Highlight current device's player
- Recalculate on every events change (via Realtime)

### Host Features

**Players management:**

- Add player (name input + validation)
- Remove player (soft or hard delete — check implementation)

**Challenges management:**

- Create/edit/delete challenges
- Toggle `is_active` to show/hide from player view
- `bonus_points` can be null (some challenges may not have bonus)
- `sort_order` for custom ordering

**Activity feed undo:**

- Host can delete an `events` row to reverse a claim
- Useful for mistakes or disputes

## Important Patterns

### Per-Game Data Isolation

- All challenges are per-game (no global challenge packs)
- Players belong to a single game
- Always filter queries by `game_id` to prevent data leakage

### Error Handling

- Unique constraint violations on `events` → "Already claimed" message
- Foreign key violations (deleted player/challenge) → graceful error
- Network errors → retry or show user-friendly message

### Mobile-First Design

- UI optimized for "stag conditions" (fat thumbs + a few pints)
- Large tap targets
- Clear visual feedback on actions
- Confetti and toasts for positive reinforcement

### TypeScript Types

- Define types for all DB rows (games, players, challenges, events)
- Use TypeScript's strict mode
- Prefer explicit types over `any`

## Testing Strategy

Before each commit, validate:

1. **Type checking:** `npm run typecheck` must pass
2. **Linting:** `npm run lint` must pass
3. **Unit tests:** `npm test` must pass
   - Test scoreboard calculation logic
   - Test claim state detection (already claimed or not)
4. **E2E sanity check:**
   - Create game → add 5 players → add 2 challenges
   - Claim base/bonus → verify uniqueness enforcement
   - Open two browser windows → verify realtime updates

## Common Gotchas

- **Challenge bonus_points can be null** — handle in UI (don't show bonus button if null)
- **localStorage is per-device** — same physical person on two devices = two identities
- **Supabase Realtime requires correct RLS policies** — ensure policies allow subscription
- **Unique constraint on events** — always handle error code 23505 gracefully
- **Game link sharing** — ensure `/g/[gameId]` is shareable without auth barriers

## Code Style

- Use Tailwind utility classes (avoid custom CSS where possible)
- Component organization: `/components` for shared, `/app` for route-specific
- Keep components small and focused
- Use React Server Components by default; Client Components only when needed (realtime, localStorage, confetti)
