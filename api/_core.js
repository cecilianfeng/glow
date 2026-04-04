// Shared Claude prompt logic — used by both the Vercel handler and the Vite dev middleware

export const SYSTEM_PROMPT = `You are Glow, an expert content strategist and LinkedIn growth specialist.
Your job is to transform any content into high-performing LinkedIn assets.

Always respond with ONLY valid JSON — no markdown fences, no extra text.`;

export function buildUserPrompt(inputData) {
  const { type, title, text, url, author, images = [] } = inputData;

  let contentBlock = '';
  if (type === 'youtube') {
    contentBlock = `YouTube Video
Title: ${title}
Channel: ${author || 'Unknown'}
URL: ${url}`;
  } else {
    contentBlock = `Content: ${title || 'Untitled'}
Type: ${type}${url ? `\nSource: ${url}` : ''}

${(text || '').slice(0, 6000)}`;
  }

  const hasImages = images.length > 0;
  const imageContext = hasImages
    ? `\n\nExtracted images available (${images.length} total):
${images.map((img, i) => `  [${i}] ${img.alt || img.url?.split('/').pop()?.slice(0, 60) || 'image'}`).join('\n')}

When assigning images to carousel slides, use imageIndex (0-based). Assign images to slides where they add visual value. Not every slide needs an image. For slides with imageIndex set, use layout "image". For slides without images, choose the best text layout from: "headline", "number", "quote".`
    : '\n\nNo images available — use text-only layouts for all slides.';

  return `Analyze this content and generate LinkedIn assets.

${contentBlock}
${imageContext}

Return ONLY this JSON (no markdown, no extra text):
{
  "sourceTitle": "short title for attribution (max 60 chars)",
  "summary": "2-3 sentence summary",
  "takeaways": [
    {
      "point": "key insight as a punchy quotable statement (max 140 chars)",
      "elaboration": "1-2 sentence elaboration"
    }
  ],
  "linkedinPost": {
    "hook": "scroll-stopping first line — bold claim, surprising stat, or provocative question (max 200 chars)",
    "body": "post body — short paragraphs (2-3 lines), 3-5 bullet insights, specific and actionable, 400-600 words",
    "cta": "one specific call-to-action driving comments or saves",
    "hashtags": "8-12 hashtags: #tag1 #tag2 ..."
  },
  "carousel": [
    {
      "headline": "slide headline (max 80 chars)",
      "body": "supporting text (max 180 chars, null for cover/CTA slides)",
      "cta": "CTA text for last slide only, null otherwise",
      "layout": "image|headline|number|quote",
      "imageIndex": null,
      "stat": "big number or stat to highlight if layout=number, else null",
      "quote": "pull quote text if layout=quote, else null"
    }
  ]
}

RULES:
- takeaways: exactly 5 items
- carousel: exactly 10 slides
  - Slide 1: cover/title — compelling headline, layout "headline" or "image" (use hero image if available), body null
  - Slides 2-8: one insight per slide — pick best layout for each: "image" with imageIndex if a relevant image exists, "number" for stats/numbered insights, "quote" for strong statements, "headline" for general insights
  - Slide 9: synthesis/conclusion — layout "headline" or "quote"
  - Slide 10: CTA slide — set cta field, body null, layout "headline"
- Spread image usage across slides — don't cluster all images at the start
- layout "number": put the key stat or number in the "stat" field (e.g. "73%", "#1", "5x")
- layout "quote": put the pull quote text in "quote" field (impactful, max 120 chars)
- Respond ONLY with the JSON object`;
}

export function parseClaudeResponse(rawText) {
  const jsonText = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(jsonText);
}
