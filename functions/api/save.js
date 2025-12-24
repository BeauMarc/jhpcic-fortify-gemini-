export async function onRequestPost(context) {
  // CORS headers allowing access from the frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Parse JSON body
    const data = await context.request.json();
    const id = crypto.randomUUID(); // Unique ID for short link
    const timestamp = Date.now();

    const storageRecord = {
      id,
      timestamp,
      data
    };

    // Access KV Namespace bound as 'JHPCIC_STORE'
    if (context.env.JHPCIC_STORE) {
      // Save with 30-day expiration
      await context.env.JHPCIC_STORE.put(`order:${id}`, JSON.stringify(storageRecord), { expirationTtl: 2592000 });
      return new Response(JSON.stringify({ success: true, id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      return new Response(JSON.stringify({ error: "KV Namespace 'JHPCIC_STORE' not bound in Pages Settings" }), { status: 500, headers: corsHeaders });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// Handle preflight OPTIONS request
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}