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
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });

    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: "Impossible de charger la page Bandcamp" }) };
    }

    const html = await res.text();

    // Method 1: data-tralbum attribute (most common)
    const tralbumMatch = html.match(/data-tralbum="([^"]+)"/);
    if (tralbumMatch) {
      try {
        const tralbum = JSON.parse(tralbumMatch[1].replace(/&quot;/g, '"'));
        const id = tralbum.id;
        const isAlbum = url.includes('/album/');
        const type = isAlbum ? 'album' : 'track';
        const embedUrl = `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/size=large/bgcol=111111/linkcol=e8d5a3/artwork=small/transparent=true/`;
        return { statusCode: 200, headers, body: JSON.stringify({ embedUrl }) };
      } catch(e) {}
    }

    // Method 2: TralbumData in inline script
    const tralbumDataMatch = html.match(/TralbumData\s*=\s*(\{[\s\S]*?\});\s*\n/);
    if (tralbumDataMatch) {
      try {
        const data = JSON.parse(tralbumDataMatch[1]);
        const id = data.id;
        const isAlbum = url.includes('/album/');
        const type = isAlbum ? 'album' : 'track';
        const embedUrl = `https://bandcamp.com/EmbeddedPlayer/${type}=${id}/size=large/bgcol=111111/linkcol=e8d5a3/artwork=small/transparent=true/`;
        return { statusCode: 200, headers, body: JSON.stringify({ embedUrl }) };
      } catch(e) {}
    }

    // Method 3: og:video or og:audio meta tag with embed URL
    const ogVideoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
    if (ogVideoMatch) {
      return { statusCode: 200, headers, body: JSON.stringify({ embedUrl: ogVideoMatch[1] }) };
    }

    // Method 4: direct EmbeddedPlayer URL in page source
    const embeddedMatch = html.match(/https:\/\/bandcamp\.com\/EmbeddedPlayer\/(?:album|track)=(\d+)[^"']*/);
    if (embeddedMatch) {
      let embedUrl = embeddedMatch[0]
        .replace(/bgcol=[a-fA-F0-9]+/, 'bgcol=111111')
        .replace(/linkcol=[a-fA-F0-9]+/, 'linkcol=e8d5a3');
      return { statusCode: 200, headers, body: JSON.stringify({ embedUrl }) };
    }

    // Method 5: extract numeric ID from canonical URL in page
    const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
    const idFromMeta = html.match(/"id":(\d+),"type":"(?:album|track)"/);
    if (idFromMeta) {
      const isAlbum = url.includes('/album/');
      const type = isAlbum ? 'album' : 'track';
      const embedUrl = `https://bandcamp.com/EmbeddedPlayer/${type}=${idFromMeta[1]}/size=large/bgcol=111111/linkcol=e8d5a3/artwork=small/transparent=true/`;
      return { statusCode: 200, headers, body: JSON.stringify({ embedUrl }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: "Embed introuvable — cet album est peut-être privé ou non embeddable" }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};