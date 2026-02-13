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
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
```

4. Click **Run** or press Cmd/Ctrl + Enter
5. You should see "Success. No rows returned" for each command

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

## Technical Details

- **Publication**: `supabase_realtime` (built-in Supabase publication)
- **Tables**: `events`, `players`, `challenges`
- **Why needed**: By default, tables are not included in the Realtime publication for security reasons
- **RLS**: Already configured to allow all operations (see `supabase/schema.sql`)

## References

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [Postgres Publications](https://www.postgresql.org/docs/current/sql-createpublication.html)
