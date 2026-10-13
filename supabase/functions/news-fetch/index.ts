const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const newsApiKey = Deno.env.get("NEWSAPI_KEY");

    const url = new URL(req.url);
    const district = url.searchParams.get("district") || "";
    const state = url.searchParams.get("state") || "";
    const country = url.searchParams.get("country") || "India";

    if (!newsApiKey) {
      // Return placeholder articles explaining the key is missing
      return new Response(
        JSON.stringify({
          articles: [],
          meta: { keyMissing: true, message: "NEWSAPI_KEY is not configured." },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a focused query: prefer district, fall back to state
    const location = district || state || country;
    const query = `("air quality" OR "AQI" OR "pollution" OR "air pollution") AND ("${location}")`;

    const apiUrl = new URL("https://newsapi.org/v2/everything");
    apiUrl.searchParams.set("q", query);
    apiUrl.searchParams.set("language", "en");
    apiUrl.searchParams.set("sortBy", "publishedAt");
    apiUrl.searchParams.set("from", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    apiUrl.searchParams.set("pageSize", "12");
    apiUrl.searchParams.set("apiKey", newsApiKey);

    const res = await fetch(apiUrl.toString(), {
      headers: { "User-Agent": "AQI-Monitor/1.0" },
    });

    if (!res.ok) {
      // If district-level yields no results try state-level fallback
      if (res.status === 426 || res.status === 429) {
        return new Response(
          JSON.stringify({ articles: [], meta: { error: "News API rate limit reached. Try again later." } }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`NewsAPI returned ${res.status}`);
    }

    const data = await res.json();

    if ((!data.articles || data.articles.length === 0) && district) {
      // Fallback: try state-level query
      const fallbackQuery = `("air quality" OR "AQI" OR "pollution") AND ("${state || country}")`;
      const fallbackUrl = new URL("https://newsapi.org/v2/everything");
      fallbackUrl.searchParams.set("q", fallbackQuery);
      fallbackUrl.searchParams.set("language", "en");
      fallbackUrl.searchParams.set("sortBy", "publishedAt");
      fallbackUrl.searchParams.set("from", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      fallbackUrl.searchParams.set("pageSize", "12");
      fallbackUrl.searchParams.set("apiKey", newsApiKey);

      const fallbackRes = await fetch(fallbackUrl.toString(), {
        headers: { "User-Agent": "AQI-Monitor/1.0" },
      });

      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        return new Response(
          JSON.stringify({
            articles: (fallbackData.articles || []).map(sanitizeArticle),
            meta: { query: fallbackQuery, fallback: true, location: state || country },
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        articles: (data.articles || []).map(sanitizeArticle),
        meta: { query, location },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ articles: [], meta: { error: err.message || "Failed to fetch news" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function sanitizeArticle(a: Record<string, unknown>) {
  return {
    title: String(a.title || "").replace(/\s*\[.*?\]\s*$/, ""),
    description: a.description ? String(a.description).slice(0, 200) : null,
    url: String(a.url || ""),
    source: (a.source as { name?: string })?.name || "Unknown",
    publishedAt: String(a.publishedAt || ""),
    urlToImage: a.urlToImage ? String(a.urlToImage) : null,
  };
}
