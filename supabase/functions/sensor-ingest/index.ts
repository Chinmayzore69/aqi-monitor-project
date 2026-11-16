import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function adcToAQI(adc: number): number {
  return Math.min(500, Math.round(adc / 8));
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

    const { device_id, adc, timestamp, latitude, longitude, location_label, user_id } = body;

    if (!device_id || typeof device_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'device_id'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (adc === undefined) {
      return new Response(
        JSON.stringify({ error: "Must provide 'adc'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adcValue = Number(adc);
    if (isNaN(adcValue) || adcValue < 0) {
      return new Response(
        JSON.stringify({ error: `Invalid 'adc' value: ${adc}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const estimatedAqi = adcToAQI(adcValue);
    const category = getCategory(estimatedAqi);

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
        estimated_aqi: estimatedAqi,
        category,
        reading_type: "live",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        location_label: location_label ?? null,
        device_timestamp: timestamp ?? null,
        user_id: user_id ?? null,
      })
      .select("id, adc, estimated_aqi, category, received_at")
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
