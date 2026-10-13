import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// MQ-135 calculation constants — uncalibrated defaults for educational use
const VREF = 3.3; // ESP32 ADC reference voltage
const ADC_MAX = 4095; // 12-bit ADC
const RL = 10.0; // load resistance in kOhm (typical MQ-135 module)
const VC = 5.0; // sensor circuit supply voltage
const R0 = 100.0; // baseline resistance in kOhm — MUST be calibrated with clean air
const A = 116.6020682; // power-law constant (CO2 curve, illustrative)
const B = -2.769034857; // power-law exponent (CO2 curve, illustrative)

function adcToVoltage(adc: number): number {
  return (adc / ADC_MAX) * VREF;
}

function voltageToResistance(vout: number): number {
  if (vout <= 0) return Infinity;
  return RL * (VC / vout - 1);
}

function resistanceToPPM(rs: number, r0: number): number {
  const ratio = rs / r0;
  if (ratio <= 0 || !isFinite(ratio)) return 0;
  return Math.pow(ratio / A, 1 / B);
}

// Provisional experimental AQI mapping from estimated PPM
// This is NOT an official CPCB AQI — it's a configurable educational approximation
function ppmToExperimentalAQI(ppm: number): number {
  // Mapping based on CO2-equivalent ranges (illustrative)
  // 400 ppm ≈ clean air → AQI ~25
  // 1000 ppm → AQI ~80
  // 2000 ppm → AQI ~150
  // 5000 ppm → AQI ~300
  if (ppm <= 400) return Math.max(0, Math.round((ppm / 400) * 25));
  if (ppm <= 1000) return Math.round(25 + ((ppm - 400) / 600) * 55);
  if (ppm <= 2000) return Math.round(80 + ((ppm - 1000) / 1000) * 70);
  if (ppm <= 5000) return Math.round(150 + ((ppm - 2000) / 3000) * 150);
  return Math.min(500, Math.round(300 + ((ppm - 5000) / 5000) * 200));
}

function getCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();

    // Validate required fields
    const { device_id, adc, voltage, timestamp, latitude, longitude, location_label, user_id } = body;

    if (!device_id || typeof device_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'device_id'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (adc === undefined && voltage === undefined) {
      return new Response(
        JSON.stringify({ error: "Must provide 'adc' or 'voltage'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate values
    const adcValue = adc !== undefined ? Number(adc) : null;
    const voltageValue = voltage !== undefined
      ? Number(voltage)
      : adcValue !== null ? adcToVoltage(adcValue) : null;

    if (voltageValue !== null && (voltageValue < 0 || voltageValue > VC)) {
      return new Response(
        JSON.stringify({ error: `Voltage out of range (0–${VC}V): ${voltageValue}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rs = voltageValue !== null ? voltageToResistance(voltageValue) : null;
    const rsRoRatio = rs !== null ? rs / R0 : null;
    const ppm = rs !== null ? resistanceToPPM(rs, R0) : null;
    const estimatedAqi = ppm !== null ? ppmToExperimentalAQI(ppm) : null;
    const category = estimatedAqi !== null ? getCategory(estimatedAqi) : null;

    // Upsert device
    const { error: deviceError } = await supabase
      .from("devices")
      .upsert({
        device_id,
        status: "receiving",
        last_seen_at: new Date().toISOString(),
      }, { onConflict: "device_id" });

    if (deviceError) {
      return new Response(
        JSON.stringify({ error: `Failed to upsert device: ${deviceError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert reading
    const { data, error } = await supabase
      .from("sensor_readings")
      .insert({
        device_id,
        adc: adcValue,
        voltage: voltageValue,
        rs: rs !== null && isFinite(rs) ? rs : null,
        rs_ro_ratio: rsRoRatio !== null && isFinite(rsRoRatio) ? rsRoRatio : null,
        estimated_ppm: ppm !== null && isFinite(ppm) ? ppm : null,
        estimated_aqi: estimatedAqi,
        category,
        reading_type: "live",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        location_label: location_label ?? null,
        device_timestamp: timestamp ?? null,
        user_id: user_id ?? null,
      })
      .select("id, estimated_aqi, category, voltage, estimated_ppm, received_at")
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: `Failed to insert reading: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, reading: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
