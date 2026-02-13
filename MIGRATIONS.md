# Supabase Migrations Guide

## Setup Supabase CLI

### 1. Install Supabase CLI

```bash
# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Or using npm
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link your project

```bash
# Get your project ref from the URL: https://app.supabase.com/project/YOUR_PROJECT_REF
supabase link --project-ref adrkoblbcylrgkzsoexb
```

### 4. Pull existing schema (optional)

If you've already applied schema manually, pull it to create a migration:

```bash
supabase db pull
```

This creates a migration file in `supabase/migrations/` with your current database state.

## Creating New Migrations

### Manual migration file

```bash
supabase migration new add_new_feature
```

This creates a new migration file in `supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql`

### Example: Add a column

```sql
-- supabase/migrations/20260213_add_player_avatar.sql
ALTER TABLE players ADD COLUMN avatar_url TEXT;
```

### Apply migrations

```bash
# Apply to local dev (if using local Supabase)
supabase db push

# Or apply directly to remote
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

## Best Practices

1. **Never edit applied migrations** - Always create new migrations for changes
2. **Use descriptive names** - `add_challenge_images` not `update_1`
3. **Test locally first** - Use `supabase start` for local development
4. **Version control** - Commit all migration files to git
5. **Idempotent migrations** - Use `IF NOT EXISTS` where possible

## Current Setup

For this project, we've manually applied the initial schema. To convert to migrations:

```bash
# Pull current schema to create baseline migration
supabase db pull

# This will create: supabase/migrations/YYYYMMDDHHMMSS_remote_commit.sql
```

From now on, all schema changes should be done via migrations:

```bash
# Create new migration
supabase migration new your_change_name

# Edit the file in supabase/migrations/

# Apply it
supabase db push
```

## Alternative: Direct SQL execution

If you prefer not to use migrations yet, you can execute SQL directly:

```bash
# Execute a SQL file
supabase db execute -f supabase/schema.sql

# Or inline SQL
supabase db execute "ALTER TABLE players ADD COLUMN avatar_url TEXT;"
```
