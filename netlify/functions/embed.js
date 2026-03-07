exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const url = event.queryStringParameters && event.queryStringParameters.url;
  if (!url || !url.includes("bandcamp.com")) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "URL Bandcamp requise" }) };
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; diglist/1.0)",
      },
    });

    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Impossible de charger la page Bandcamp" }) };
    }

    const html = await res.text();

    // Extract embed URL from Bandcamp page
    // Bandcamp embeds follow the pattern: https://bandcamp.com/EmbeddedPlayer/album=XXXXXXX or /track=XXXXXXX
    const albumMatch = html.match(/https:\/\/bandcamp\.com\/EmbeddedPlayer\/album=(\d+)/);
    const trackMatch = html.match(/https:\/\/bandcamp\.com\/EmbeddedPlayer\/track=(\d+)/);

    let embedUrl = null;

    if (albumMatch) {
      embedUrl = `https://bandcamp.com/EmbeddedPlayer/album=${albumMatch[1]}/size=large/bgcol=111111/linkcol=e8d5a3/artwork=small/transparent=true/`;
    } else if (trackMatch) {
      embedUrl = `https://bandcamp.com/EmbeddedPlayer/track=${trackMatch[1]}/size=large/bgcol=111111/linkcol=e8d5a3/artwork=small/transparent=true/`;
    }

    if (!embedUrl) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Embed introuvable pour cette URL" }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ embedUrl }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};