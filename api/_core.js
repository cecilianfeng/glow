// Shared Claude prompt logic — used by the Vercel handler and Vite dev middleware

export const SYSTEM_PROMPT = `You are Glow, an expert LinkedIn content strategist and editorial designer.
Your task: deeply analyze the given content and generate a complete, high-quality LinkedIn content kit.
Always respond with ONLY valid JSON — no markdown fences, no extra text, no commentary.`;

export function buildUserPrompt({ type, title, text, url, author, images = [], identityMode = 'author' }) {
  const isAuthor = identityMode === 'author';

  let contentBlock = '';
  if (type === 'youtube') {
    contentBlock = `YouTube Video\nTitle: ${title}\nChannel: ${author || 'Unknown'}\nURL: ${url}`;
  } else {
    contentBlock = `Content: ${title || 'Untitled'}\nType: ${type}${url ? `\nSource: ${url}` : ''}${author ? `\nAuthor: ${author}` : ''}\n\n${(text || '').slice(0, 6000)}`;
  }

  const voiceNote = isAuthor
    ? `IDENTITY MODE — AUTHOR: The user IS the creator of this content. LinkedIn copy must use first person ("I recently published...", "In my latest piece...", "I explore...", "My key argument..."). Carousel should feel like the creator sharing their own work.`
    : `IDENTITY MODE — RECOMMENDER: The user is RECOMMENDING this content (NOT the author). LinkedIn copy must use recommendation voice ("This piece by [author/source] is worth your time...", "I've been thinking about this insight...", "If you haven't read this yet..."). Reference the original author when known.`;

  const hasImages = images.length > 0;
  const imageContext = hasImages
    ? `\nImages available (${images.length} total): ${images.map((img, i) => `[${i}]: ${img.alt || img.url?.split('/').pop()?.slice(0, 40) || 'image'}`).join(' | ')}\nUse imageIndex (0-based) when assigning images to "image" layout slides.`
    : `\nNo images available — do NOT use "image" layout in carousel.`;

  return `Analyze this content and generate a complete LinkedIn content kit.

=== CONTENT ===
${contentBlock}

=== INSTRUCTIONS ===
${voiceNote}
${imageContext}

Return ONLY this JSON object (no markdown, no extra text):
{
  "contentType": "opinion|tutorial|story|data|comparison",
  "sourceTitle": "concise attribution title (max 60 chars)",
  "summary": "2-3 sentence factual content summary",
  "keyPoints": ["core insight 1", "core insight 2", "core insight 3", "core insight 4"],
  "coverData": {
    "headline": "bold punchy headline for the cover image (max 55 chars)",
    "subline": "author credit or subtitle (max 70 chars)",
    "tag": "${isAuthor ? 'e.g. "My Latest Article" or "New Post" or "Deep Dive"' : 'e.g. "Must Read" or "Recommended" or "Worth Your Time"'}"
  },
  "linkedinPost": {
    "hook": "scroll-stopping first line (max 200 chars) — bold claim, surprising stat, rhetorical question, or contrarian take",
    "body": "post body with short paragraphs and 3-5 specific bullet points, actionable and specific, 400-700 chars total",
    "cta": "single action-driving CTA — ask a question, invite comments, or request saves",
    "hashtags": "10-12 relevant hashtags as a single string"
  },
  "carousel": [
    {
      "layout": "cover|insight|stat|quote|list|image|cta",
      "alignment": "left|center",
      "tag": "small label above headline (max 20 chars) — null for cover and cta slides",
      "headline": "slide headline (max 75 chars)",
      "body": "supporting text (max 150 chars) — null for cover, cta, and stat slides",
      "stat": "key number/stat if layout=stat (e.g. '73%', '10x', '#1', '$2M') — null for other layouts",
      "statLabel": "what the stat measures if layout=stat (max 40 chars) — null for other layouts",
      "quote": "verbatim pull quote if layout=quote (max 110 chars, must be punchy) — null for other layouts",
      "items": ["item 1 (max 45 chars)", "item 2 (max 45 chars)", "item 3 (max 45 chars)"],
      "imageIndex": null,
      "cta": "follow/save CTA text only for the LAST slide (e.g. 'Follow for more insights →') — null for all other slides"
    }
  ]
}

=== CAROUSEL RULES ===
- Generate exactly 8 slides total
- Slide 1 (index 0): MUST be layout="cover", alignment="center", tag="${isAuthor ? 'My Latest' : 'Must Read'}", body=null, cta=null, imageIndex=null
- Slide 8 (last): MUST be layout="cta", alignment="center", tag=null, body=null, cta field required, imageIndex=null
- Slides 2-7: use insight/stat/quote/list/image — one key point each
- VARIETY: NEVER use the same layout twice in a row
- contentType drives structure:
  * "opinion" → mostly insight + quote layouts, emotional arc
  * "tutorial" → list + insight layouts, numbered steps
  * "story" → quote + insight layouts, narrative flow
  * "data" → stat + insight layouts, numbers first
  * "comparison" → stat + list layouts, contrast-driven
- For "stat" layout: stat AND statLabel required; body must be null; stat is a short number (e.g. "73%"), statLabel describes what it means
- For "list" layout: items array must have exactly 3 items (each max 45 chars); body=null is fine
- For "image" layout: imageIndex must be a valid 0-based index; only use if images are available
- For "quote" layout: pick the single most powerful, quotable statement from the content
- Alignment variety: cover=center, cta=center; mix left/center for slides 2-7
- The "tag" field for middle slides: creative labels like "Key Insight", "Pro Tip", "Rule #3", "Warning", "Remember", "The Truth", "Step 2", etc.

Respond ONLY with the JSON object.`;
}

export function parseClaudeResponse(rawText) {
  const jsonText = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(jsonText);
}
