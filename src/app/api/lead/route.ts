import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

const LeadSchema = z.object({
  name: z.string().min(2).max(80),
  company: z.string().min(2).max(120),
  designation: z.string().max(80).optional().or(z.literal('')),
  location: z.string().min(2).max(80),
  whatsapp: z.string().min(8).max(20).regex(/^[+\d\s()-]+$/, 'Invalid phone number'),
  email: z.string().email().max(120),
  problem: z.string().min(10).max(2000),
  website: z.string().max(0).optional().or(z.literal('')), // honeypot must be empty
});

/** Naive in-memory rate limit per edge instance; Supabase unique constraints back it up. */
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 3600_000) { hits.set(ip, { n: 1, t: now }); return false; }
  rec.n += 1;
  return rec.n > 5;
}

/** Trusted client IP: proxies APPEND the address they observed, so the
 *  platform-verified value is the LAST hop — never the client-controllable
 *  first entry. Using index 0 lets an attacker spoof it and defeat the limiter. */
function trustedIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return req.headers.get('x-real-ip')?.trim() ?? 'unknown';
}

/** Neutralize CSV/formula-injection before a value can reach a spreadsheet
 *  export (Supabase Table Editor → CSV → Excel/Sheets executes leading =,+,-,@). */
function csvSafe(v: string): string {
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

export async function POST(req: NextRequest) {
  const ip = trustedIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests — try again later.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the highlighted fields.' }, { status: 400 });
  }
  if (parsed.data.website) {
    // Honeypot triggered — pretend success, store nothing.
    return NextResponse.json({ ok: true });
  }

  const { website: _hp, ...lead } = parsed.data;
  const safeLead = Object.fromEntries(
    Object.entries(lead).map(([k, v]) => [k, typeof v === 'string' ? csvSafe(v) : v]),
  );

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Lead received but Supabase env vars missing');
    return NextResponse.json({ error: 'Temporarily unavailable — email kundanlm10@gmail.com directly.' }, { status: 503 });
  }

  const res = await fetch(`${url}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...safeLead, ip, created_at: new Date().toISOString() }),
  });

  if (!res.ok) {
    console.error('Supabase insert failed', res.status, await res.text());
    return NextResponse.json({ error: 'Could not save — email kundanlm10@gmail.com directly.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
