/*
# Add User Accounts — Multi-User Support

## Purpose
Transition the AQI monitor from single-tenant to multi-user. Each user gets their own
account (email/password or Google OAuth) and can see their personal sensor reading history.

## Changes

### 1. Add `user_id` column to `sensor_readings`
- `user_id` (uuid, nullable, defaults to `auth.uid()`) — links a reading to the
  authenticated user who was monitoring when the reading was recorded.
- Existing readings get `NULL` user_id (they remain accessible as shared/public data).
- An index on `(user_id, received_at DESC)` speeds up per-user history queries.

### 2. RLS policy changes on `sensor_readings`
- Keep existing `anon` policies for public/shared data (readings with `user_id IS NULL`).
- Add new `authenticated` policies:
  - SELECT: authenticated users can read public readings (user_id IS NULL) OR their own (user_id = auth.uid()).
  - INSERT: authenticated users can insert their own readings (user_id = auth.uid()) or public readings (user_id IS NULL).
  - UPDATE: authenticated users can update their own readings only.
  - DELETE: authenticated users can delete their own readings only.

### 3. Enable Google OAuth
- Google OAuth is enabled via the Supabase Auth provider configuration (dashboard or CLI).
- The frontend uses `supabase.auth.signInWithOAuth({ provider: 'google' })`.

## Important Notes
1. `user_id` defaults to `auth.uid()` so frontend inserts that omit `user_id` still work.
2. The sensor-ingest edge function uses the service role key and bypasses RLS, so
   device ingestion continues to work. The edge function can optionally accept a
   `user_id` field to associate readings with a user.
3. The anon-key client can still read public (user_id IS NULL) readings without signing in.
4. Email confirmation remains OFF.
*/

-- Add user_id column to sensor_readings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sensor_readings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE sensor_readings ADD COLUMN user_id uuid DEFAULT auth.uid();
  END IF;
END $$;

-- Index for per-user history queries
CREATE INDEX IF NOT EXISTS sensor_readings_user_id_received_at_idx
  ON sensor_readings (user_id, received_at DESC) WHERE user_id IS NOT NULL;

-- Replace sensor_readings policies to support both public and per-user data
DROP POLICY IF EXISTS "anon_select_sensor_readings" ON sensor_readings;
DROP POLICY IF EXISTS "anon_insert_sensor_readings" ON sensor_readings;
DROP POLICY IF EXISTS "anon_update_sensor_readings" ON sensor_readings;
DROP POLICY IF EXISTS "anon_delete_sensor_readings" ON sensor_readings;

-- SELECT: anon can read public readings; authenticated can read public + own
CREATE POLICY "select_sensor_readings" ON sensor_readings FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL OR auth.uid() = user_id);

-- INSERT: anon can insert public readings; authenticated can insert own or public
CREATE POLICY "insert_sensor_readings" ON sensor_readings FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- UPDATE: only authenticated users, only their own readings
CREATE POLICY "update_own_sensor_readings" ON sensor_readings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE: only authenticated users, only their own readings
CREATE POLICY "delete_own_sensor_readings" ON sensor_readings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
