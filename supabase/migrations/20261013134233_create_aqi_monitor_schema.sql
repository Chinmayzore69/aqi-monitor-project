/*
# AQI Air Quality Monitor — Database Schema

## Purpose
Stores ESP32+MQ-135 device registrations, sensor readings, and device installation locations
for the AQI Air Quality Monitor college project. Single-tenant (no auth) — all data is
intentionally shared/public for this educational project.

## New Tables

### devices
- `id` (uuid, PK) — unique device identifier
- `device_id` (text, unique) — human-readable device name, e.g. "esp32-01"
- `name` (text) — friendly display name
- `connection_method` (text) — "wifi" | "serial" | "bluetooth"
- `status` (text) — "not_connected" | "connecting" | "connected" | "receiving" | "connection_lost"
- `last_seen_at` (timestamptz) — last time data was received
- `created_at` (timestamptz)

### device_locations
- `id` (uuid, PK)
- `device_id` (text, references devices.device_id) — which device this location belongs to
- `label` (text) — human-readable installation location, e.g. "GEC Farmagudi, Ponda, Goa"
- `latitude` (double precision) — optional
- `longitude` (double precision) — optional
- `created_at` (timestamptz)

### sensor_readings
- `id` (uuid, PK)
- `device_id` (text) — which device produced this reading
- `adc` (integer) — raw ADC value (0–4095 for 12-bit)
- `voltage` (double precision) — measured voltage
- `rs` (double precision) — calculated sensor resistance
- `rs_ro_ratio` (double precision) — Rs/R0 ratio
- `estimated_ppm` (double precision) — estimated gas concentration
- `estimated_aqi` (double precision) — experimental local AQI score
- `category` (text) — CPCB-style category label
- `reading_type` (text) — "live" | "simulated" | "invalid"
- `latitude` (double precision) — optional reading location
- `longitude` (double precision) — optional reading location
- `location_label` (text) — human-readable location at time of reading
- `received_at` (timestamptz) — when the server received it (UTC)
- `device_timestamp` (timestamptz) — timestamp from the device itself

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` policies since this is a single-tenant educational
  project with no sign-in. The anon-key frontend and the ESP32 (via edge function using service
  role key) can read and write freely.
- The edge function inserts using the service role key which bypasses RLS, so ingestion works
  regardless of policies. Frontend uses anon key for reads/writes.

## Indexes
- `sensor_readings_device_id_received_at_idx` — for history queries filtered by device + time
- `devices_device_id_idx` — for lookups by device_id string
*/

-- Devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'ESP32 Sensor',
  connection_method text NOT NULL DEFAULT 'wifi',
  status text NOT NULL DEFAULT 'not_connected',
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Device installation locations
CREATE TABLE IF NOT EXISTS device_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
  label text NOT NULL,
  latitude double precision,
  longitude double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sensor readings
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  adc integer,
  voltage double precision,
  rs double precision,
  rs_ro_ratio double precision,
  estimated_ppm double precision,
  estimated_aqi double precision,
  category text,
  reading_type text NOT NULL DEFAULT 'live',
  latitude double precision,
  longitude double precision,
  location_label text,
  received_at timestamptz NOT NULL DEFAULT now(),
  device_timestamp timestamptz
);

-- Indexes
CREATE INDEX IF NOT EXISTS sensor_readings_device_id_received_at_idx
  ON sensor_readings (device_id, received_at DESC);
CREATE INDEX IF NOT EXISTS devices_device_id_idx ON devices (device_id);

-- RLS: devices
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_devices" ON devices;
CREATE POLICY "anon_select_devices" ON devices FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_devices" ON devices;
CREATE POLICY "anon_insert_devices" ON devices FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_devices" ON devices;
CREATE POLICY "anon_update_devices" ON devices FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_devices" ON devices;
CREATE POLICY "anon_delete_devices" ON devices FOR DELETE
  TO anon, authenticated USING (true);

-- RLS: device_locations
ALTER TABLE device_locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_device_locations" ON device_locations;
CREATE POLICY "anon_select_device_locations" ON device_locations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_device_locations" ON device_locations;
CREATE POLICY "anon_insert_device_locations" ON device_locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_device_locations" ON device_locations;
CREATE POLICY "anon_update_device_locations" ON device_locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_device_locations" ON device_locations;
CREATE POLICY "anon_delete_device_locations" ON device_locations FOR DELETE
  TO anon, authenticated USING (true);

-- RLS: sensor_readings
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_select_sensor_readings" ON sensor_readings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_insert_sensor_readings" ON sensor_readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_update_sensor_readings" ON sensor_readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sensor_readings" ON sensor_readings;
CREATE POLICY "anon_delete_sensor_readings" ON sensor_readings FOR DELETE
  TO anon, authenticated USING (true);
