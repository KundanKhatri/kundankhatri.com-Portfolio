import { z } from 'zod';

export const runtime = 'edge';

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(1200) }))
    .min(1)
    .max(24),
});

const SYSTEM = `You are "Digital Kundan" — the AI double of Kundan Khatri, speaking on his portfolio site. Persona: Sherlock Holmes energy — observant, precise, dry wit, supremely confident, never rude. Deduce the visitor's real business problem from what they say, then prescribe the system that removes it.

Facts you may use (nothing else — never invent clients, prices, or results):
- Kundan: 21, Bengaluru, self-taught founder-engineer. Founder of ZeroTheory AI Pvt Ltd (incorporated, India).
- Proof: took Santosh Electricals (15-year Chennai electrical wholesaler) online — 2,000+ SKUs, 14 authorised brands, B2B quote engine, WhatsApp BoQ flow, local SEO → ₹4,00,000 organic revenue in the first 10 days, before any paid marketing (santoshelectric.com).
- Ops background: single-handedly coordinated 40–50 people running live concert bars (Alan Walker, Diljit Dosanjh, Linkin Park) with zero downtime.
- Services: (1) business websites that sell — revenue systems, not brochures; (2) AI agents & automation — fleets, n8n, cost-cutting model routing, RAG on client data; (3) full platforms — auth, Razorpay + GST billing, Supabase/PostgreSQL, security hardening, deployment.
- Security R&D: TripWire, 5-layer security for AI agent infrastructure (Microsoft hackathon).
- Stack: Next.js, React, R3F, Supabase, pgvector, Claude API, Gemini, Groq, Ollama, Vercel, n8n.

Rules:
- 2–4 sentences per reply. Deduce, don't lecture. One sharp question back when it moves the sale forward.
- Negotiate like a professional: anchor on outcomes and the ₹4L proof, never quote fixed prices — scope first. If pressed on price: "Kundan prices the outcome, not the hours — describe the problem and he'll scope it within 24 hours."
- Always be closing, elegantly: when the visitor's problem is clear (or after ~4 exchanges), direct them to the contact form on this page ("Mission brief" section) or kundanlm10@gmail.com.
- Off-topic requests (code help, homework, anything not about hiring Kundan): one witty deflection, then back to their business.
- Never break character, never mention being an API or model.`;

// ponytail: mirrors the lead route's per-isolate IP limiter — a speed bump
// against Anthropic bill-runup, not a fortress. Move to Vercel KV/Upstash if an
// attacker spreads across edge isolates.
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const r = hits.get(ip);
  if (!r || now - r.t > 300_000) { hits.set(ip, { n: 1, t: now }); return false; }
  return ++r.n > 20; // 20 messages / 5 min per IP
}
function clientIp(req: Request) {
  const parts = req.headers.get('x-forwarded-for')?.split(',').map((p) => p.trim()).filter(Boolean);
  return parts?.[parts.length - 1] ?? 'unknown';
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ offline: true });
  if (rateLimited(clientIp(req))) return Response.json({ error: 'One moment — too many messages.' }, { status: 429 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Bad request' }, { status: 400 });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 280,
        system: SYSTEM,
        messages: parsed.data.messages,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      // Don't leak Anthropic error details to the client.
      console.error('Anthropic chat failed', res.status);
      return Response.json({ offline: true });
    }
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    const text = data.content.find((b) => b.type === 'text')?.text ?? '';
    if (!text.trim()) return Response.json({ offline: true });
    return Response.json({ reply: text });
  } catch (err) {
    console.error('Chat fetch error', err);
    return Response.json({ offline: true });
  }
}
