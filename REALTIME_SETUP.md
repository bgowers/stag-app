# Supabase Realtime Setup

## Issue

The Realtime subscriptions are implemented in the code but won't work until the tables are added to the `supabase_realtime` publication in your Supabase database.

## Symptoms

- Changes made in one browser tab/device don't appear in other tabs/devices without refreshing
- Claims, scoreboard updates, and activity feed don't update live
- No WebSocket errors in console (connection works but no events are received)

## Solution

You need to enable Realtime for the `events`, `players`, and `challenges` tables.

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/adrkoblbcylrgkzsoexb
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query and paste:

```sql
-- Add tables to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;

-- Set replica identity to FULL (REQUIRED for filtering by game_id)
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE challenges REPLICA IDENTITY FULL;
```

4. Click **Run** or press Cmd/Ctrl + Enter
5. You should see "Success. No rows returned" or "ALTER TABLE" for each command

**Why replica identity FULL?** We filter subscriptions by `game_id` (not the primary key). Without REPLICA IDENTITY FULL, Realtime cannot see non-primary key columns in the changes and filtering won't work.

### Option 2: Using Supabase CLI (if you have psql installed)

```bash
PGPASSWORD=your_password psql -h aws-1-eu-west-1.pooler.supabase.com -p 5432 -U postgres.adrkoblbcylrgkzsoexb -d postgres -f supabase/migrations/20260213135006_enable_realtime.sql
```

### Option 3: Using Supabase Dashboard UI

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Find the `supabase_realtime` publication
3. Add the following tables:
   - `events`
   - `players`
   - `challenges`

## Verification

After enabling Realtime:

1. Open the app in two browser tabs
2. In tab 1: Navigate to the player view and claim a challenge
3. In tab 2: Open the host dashboard
4. You should see the claim appear immediately in the activity feed without refreshing

## How Realtime Works

The app subscribes to postgres_changes on the `events` table filtered by `game_id`:

```typescript
const channel = supabase
  .channel(`activity-${gameId}`)
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'events', filter: `game_id=eq.${gameId}` },
    () => {
      fetchEvents(); // Refetch when events change
    }
  )
  .subscribe();
```

For this to work, the table must be added to the `supabase_realtime` publication.

## Troubleshooting

### Realtime still not working after ALTER PUBLICATION?

If you ran `ALTER PUBLICATION` but Realtime still doesn't work, you likely **forgot to set replica identity**:

```sql
ALTER TABLE events REPLICA IDENTITY FULL;
ALTER TABLE players REPLICA IDENTITY FULL;
ALTER TABLE challenges REPLICA IDENTITY FULL;
```

### Why is replica identity needed?

Our subscriptions filter by `game_id`:
```typescript
filter: `game_id=eq.${gameId}`
```

Since `game_id` is **not the primary key**, PostgreSQL needs REPLICA IDENTITY FULL to include non-key columns in the replication stream. Without it, Realtime can't see `game_id` values and filtering fails silently.

### How to verify it's working?

1. Open the app in two browser tabs
2. In tab 1: Make a claim as a player
3. In tab 2: Check the host dashboard
4. The activity should appear **within 1 second** without refreshing

If you still need to refresh, the configuration isn't complete.

## Technical Details

- **Publication**: `supabase_realtime` (built-in Supabase publication)
- **Tables**: `events`, `players`, `challenges`
- **Replica Identity**: FULL (required for filtering by non-primary key columns)
- **Why needed**: By default, tables are not included in the Realtime publication for security reasons
- **RLS**: Already configured to allow all operations (see `supabase/schema.sql`)

## References

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Postgres Publications](https://www.postgresql.org/docs/current/sql-createpublication.html)
