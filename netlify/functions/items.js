const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };

  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthenticated" }) };
  }
  const userToken = authHeader.replace("Bearer ", "");

  const base = `${SUPABASE_URL}/rest/v1/items`;
  const sbHeaders = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${userToken}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  try {
    if (event.httpMethod === "GET") {
      const res = await fetch(`${base}?order=updated_at.desc`, { headers: sbHeaders });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);

      // Decode user_id from JWT
      const payload = JSON.parse(Buffer.from(userToken.split('.')[1], 'base64').toString());
      const user_id = payload.sub;

      const res = await fetch(base, {
        method: "POST",
        headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ ...body, user_id }),
      });
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === "DELETE") {
      const { id } = JSON.parse(event.body);
      const res = await fetch(`${base}?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: sbHeaders,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};