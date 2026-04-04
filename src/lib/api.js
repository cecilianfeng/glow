// Calls our Vercel serverless function which proxies to Claude API
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

  // YouTube thumbnails — pick highest resolution available
  const videoId = extractYouTubeId(url);
  const thumbnail = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : data.thumbnail_url;

  return {
    title: data.title,
    author: data.author_name,
    thumbnail,
    images: thumbnail ? [thumbnail] : [],
    type: 'youtube',
    url,
  };
}

function extractYouTubeId(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Extract images from parsed HTML document
function extractImagesFromDoc(doc, baseUrl) {
  const images = [];
  const seen = new Set();

  doc.querySelectorAll('img').forEach(img => {
    let src = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
    if (!src) return;

    // Resolve relative URLs
    try {
      src = new URL(src, baseUrl).href;
    } catch {
      return;
    }

    // Skip tiny icons, tracking pixels, SVG data URLs, base64
    if (src.startsWith('data:')) return;
    if (src.includes('icon') || src.includes('logo') || src.includes('avatar')) return;

    const width = parseInt(img.getAttribute('width') || '0');
    const height = parseInt(img.getAttribute('height') || '0');
    if (width > 0 && width < 200) return;
    if (height > 0 && height < 150) return;

    if (!seen.has(src)) {
      seen.add(src);
      images.push({
        url: src,
        alt: img.getAttribute('alt') || '',
        width,
        height,
      });
    }
  });

  // Also look for Open Graph / Twitter card images in meta tags
  const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
  if (ogImage && !seen.has(ogImage)) {
    try {
      const resolved = new URL(ogImage, baseUrl).href;
      images.unshift({ url: resolved, alt: 'Cover image', isHero: true });
    } catch {}
  }

  return images.slice(0, 12); // cap at 12 images
}

// Generic URL content + image extraction via allorigins.win CORS proxy
export async function fetchUrlContent(url) {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('Could not fetch URL content.');
  const data = await res.json();

  const parser = new DOMParser();
  const doc = parser.parseFromString(data.contents, 'text/html');

  // Extract images before removing elements
  const images = extractImagesFromDoc(doc, url);

  // Strip non-content elements
  doc.querySelectorAll('script, style, nav, header, footer, aside, [role="navigation"], [role="banner"]').forEach(el => el.remove());

  const text = doc.body?.innerText || doc.body?.textContent || '';
  const title = doc.title || url;

  return {
    title,
    text: text.replace(/\s+/g, ' ').trim().slice(0, 8000),
    images,
    type: 'url',
    url,
  };
}

// Extract images from raw HTML string (file upload)
export function extractImagesFromHtmlFile(htmlString, filename) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const images = extractImagesFromDoc(doc, 'file://');

  doc.querySelectorAll('script, style, nav, header, footer').forEach(el => el.remove());
  const text = doc.body?.innerText || doc.body?.textContent || '';
  const title = doc.title || filename;

  return {
    title,
    text: text.replace(/\s+/g, ' ').trim().slice(0, 8000),
    images,
    type: 'file',
    url: null,
  };
}
