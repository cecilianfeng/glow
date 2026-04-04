import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt, parseClaudeResponse } from './_core.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
      messages: [{ role: 'user', content: buildUserPrompt(inputData) }],
    });

    const result = parseClaudeResponse(message.content[0].text.trim());
    return res.status(200).json(result);
  } catch (err) {
    console.error('Claude API error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned invalid JSON. Please try again.' });
    }
    return res.status(500).json({ error: err.message || 'Generation failed. Please try again.' });
  }
}
