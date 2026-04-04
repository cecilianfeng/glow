import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Glow, an expert content strategist and LinkedIn growth specialist.
Your job is to transform any content (articles, YouTube videos, blog posts) into high-performing LinkedIn assets.

Always respond with ONLY valid JSON — no markdown fences, no extra text.`;

function buildUserPrompt(inputData) {
  let contentBlock = '';

  if (inputData.type === 'youtube') {
    contentBlock = `
YouTube Video:
Title: ${inputData.title}
Channel: ${inputData.author}
URL: ${inputData.url}
${inputData.description ? `Description: ${inputData.description}` : ''}
    `.trim();
  } else {
    contentBlock = `
Content Title: ${inputData.title || 'Untitled'}
Content Type: ${inputData.type}
${inputData.url ? `Source URL: ${inputData.url}` : ''}

Content:
${(inputData.text || '').slice(0, 6000)}
    `.trim();
  }

  return `Analyze the following content and generate LinkedIn assets.

${contentBlock}

Return this exact JSON structure (no markdown, no extra text):
{
  "sourceTitle": "short title for attribution (max 60 chars)",
  "summary": "2-3 sentence summary of the content",
  "takeaways": [
    {
      "point": "key insight as a punchy, quotable statement (max 140 chars)",
      "elaboration": "1-2 sentence elaboration"
    }
  ],
  "linkedinPost": {
    "hook": "attention-grabbing first line (max 200 chars) — bold claim, question, or provocative statement. MUST make people stop scrolling.",
    "body": "the full body of the post. Use short paragraphs (2-3 lines max), line breaks between thoughts. Include 3-5 bullet points or numbered insights. Make it valuable, specific, and actionable. 400-600 words.",
    "cta": "clear, specific call-to-action that drives engagement (comment, share, save). One sentence.",
    "hashtags": "8-12 relevant hashtags — mix of niche and broad. Format: #hashtag1 #hashtag2 ..."
  },
  "carousel": [
    {
      "headline": "slide title (max 80 chars)",
      "body": "slide body text (max 200 chars)",
      "cta": null
    }
  ]
}

Requirements:
- takeaways: exactly 5 items
- carousel: exactly 10 slides. Slide 1 = hook/title slide (compelling headline + no body). Slides 2-9 = one insight per slide with headline + short body. Slide 10 = CTA slide (set cta field, no body).
- LinkedIn post hook must be a genuine scroll-stopper — specific, bold, surprising
- All content must be based solely on what was provided
- Respond ONLY with the JSON object, nothing else`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const inputData = req.body;

  if (!inputData) {
    return res.status(400).json({ error: 'No input data provided' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(inputData),
        },
      ],
    });

    const rawText = message.content[0].text.trim();

    // Strip any accidental markdown fences
    const jsonText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const result = JSON.parse(jsonText);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Claude API error:', err);

    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned invalid JSON. Please try again.' });
    }

    return res.status(500).json({
      error: err.message || 'Generation failed. Please try again.',
    });
  }
}
