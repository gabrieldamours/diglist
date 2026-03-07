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
    const oembedRes = await fetch(
      `https://bandcamp.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );

    if (!oembedRes.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "oEmbed indisponible pour cette URL" }) };
    }

    const oembed = await oembedRes.json();

    // Extract src from the iframe html field
    const srcMatch = oembed.html && oembed.html.match(/src="([^"]+)"/);
    if (!srcMatch) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Embed introuvable" }) };
    }

    // Customize the embed URL colors to match diglist theme
    let embedUrl = srcMatch[1]
      .replace(/bgcol=[^/]+/, 'bgcol=111111')
      .replace(/linkcol=[^/]+/, 'linkcol=e8d5a3');

    // Force small artwork and large size
    if (!embedUrl.includes('artwork=')) embedUrl += 'artwork=small/';
    if (!embedUrl.includes('size=')) embedUrl = embedUrl.replace('/EmbeddedPlayer/', '/EmbeddedPlayer/size=large/');

    return { statusCode: 200, headers, body: JSON.stringify({ embedUrl }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};