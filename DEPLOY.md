# Deploy kundankhatri.com — 3 steps

## 1. One-time setup (Terminal on your Mac)
```bash
cd <this folder>
npx vercel login          # login with your Vercel account
```

## 2. Environment variables (required for the lead form)
In Vercel dashboard → Project → Settings → Environment Variables, add:
```
SUPABASE_URL=https://wxlcrgaiyotblzdrtarb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Supabase dashboard → zerotheory project → Settings → API → service_role key>
```
(The leads table already exists with RLS locked. Never expose the service key client-side — it lives only in Vercel env.)

## 3. Deploy
```bash
npx vercel --prod
```
Then: Vercel dashboard → Domains → add kundankhatri.com → follow the DNS instructions at your registrar.

## Notes
- Build uses `next build --turbopack` (configured).
- Robot model: public/models/robot-kundan.glb (Draco-compressed, 442KB).
- Leads land in Supabase `zerotheory` project → `leads` table. Check: Table Editor → leads.
