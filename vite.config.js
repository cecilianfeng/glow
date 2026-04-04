import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Manually load .env into process.env (works regardless of dotenv version)
try {
  const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key) process.env[key] = val;
  }
} catch {
  // .env not present — that's fine in CI/production
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devApiPlugin(),
  ],
});

/**
 * Dev-only Vite plugin: handles /api/generate locally,
 * mirroring the Vercel serverless function — no `vercel dev` needed.
 */
function devApiPlugin() {
  return {
    name: 'glow-dev-api',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use('/api/generate', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const inputData = JSON.parse(body);

            const [{ default: Anthropic }, { SYSTEM_PROMPT, buildUserPrompt, parseClaudeResponse }] =
              await Promise.all([
                import('@anthropic-ai/sdk'),
                import('./api/_core.js'),
              ]);

            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in .env');

            const client = new Anthropic({ apiKey });
            const message = await client.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 4096,
              system: SYSTEM_PROMPT,
              messages: [{ role: 'user', content: buildUserPrompt(inputData) }],
            });

            const result = parseClaudeResponse(message.content[0].text.trim());
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err) {
            console.error('[Glow dev API]', err.message);
            const status = err instanceof SyntaxError ? 500 : (err.status || 500);
            const msg = err instanceof SyntaxError
              ? 'AI returned invalid JSON. Please try again.'
              : (err.message || 'Generation failed.');
            res.statusCode = status;
            res.end(JSON.stringify({ error: msg }));
          }
        });
      });
    },
  };
}
