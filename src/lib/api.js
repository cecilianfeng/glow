// Calls our own Vercel serverless function which proxies to Claude API
export async function generateContent(inputData) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputData),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || 'Generation failed');
  }

  return response.json();
}

// YouTube oEmbed — no API key needed
export async function fetchYouTubeData(url) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) throw new Error('Could not fetch YouTube data. Check the URL.');
  const data = await res.json();
  return {
    title: data.title,
    author: data.author_name,
    thumbnail: data.thumbnail_url,
    type: 'youtube',
    url,
  };
}

// Generic URL text extraction via a simple proxy approach
// We use allorigins.win as a lightweight CORS proxy for MVP
export async function fetchUrlContent(url) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('Could not fetch URL content.');
  const data = await res.json();

  // Strip HTML tags to get plain text
  const parser = new DOMParser();
  const doc = parser.parseFromString(data.contents, 'text/html');
  // Remove scripts and styles
  doc.querySelectorAll('script, style, nav, header, footer').forEach(el => el.remove());
  const text = doc.body?.innerText || doc.body?.textContent || '';
  const title = doc.title || url;

  return {
    title,
    text: text.slice(0, 8000), // cap for API
    type: 'url',
    url,
  };
}
