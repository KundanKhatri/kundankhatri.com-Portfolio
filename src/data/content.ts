/**
 * Single source of truth for all site content.
 * Every claim here is verified against real artifacts (live sites, incorporation, program acceptances).
 */

export const site = {
  name: 'Kundan Khatri',
  domain: 'kundankhatri.com',
  title: 'Kundan Khatri — I build revenue systems, AI agents & production platforms',
  description:
    'Founder of ZeroTheory AI Pvt Ltd. I design and ship production-grade websites, AI agent systems and business platforms that make real money for real businesses — like ₹4L organic revenue in 10 days for a Chennai wholesaler.',
  email: 'kundanlm10@gmail.com',
  accent: '#00E5FF', // electric cyan
  bg: '#050508',
} as const;

export const hero = {
  headline: 'I build systems that make businesses money.',
  sub: 'Founder · Engineer · Operator. From live-concert bar operations to AI agent fleets — I ship production, not prototypes.',
  ctas: [
    { label: 'I have a business problem', target: '#contact', kind: 'client' },
    { label: 'See what I’ve built', target: '#work', kind: 'work' },
  ],
} as const;

/** Scroll-driven story chapters — the robot walks through these. */
export const chapters = [
  {
    id: 'origin',
    era: 'Age 20 · First year of college',
    title: 'FocusAddict',
    body:
      'Built a spirituality-rooted streetwear brand from zero — brand, e-commerce, drops. "Distraction is the enemy, focus is the ritual." Paused it, learned why, and it’s coming back.',
    link: { label: 'focusaddict.com', href: 'https://focusaddict.com' },
    robotAction: 'spawn', // robot boots up
  },
  {
    id: 'operations',
    era: 'Sep 2024 – Mar 2026 · Bangalore',
    title: 'Live-event operations at scale',
    body:
      'Bartender → bar supervisor → concert bar-stock distributor across major shows: Alan Walker, Diljit Dosanjh, Linkin Park, Hanumankind, Prateek Kuhad, Seedhe Maut — plus premium weddings. Single-handedly coordinated 40–50 people to keep bars stocked mid-show, live, with zero downtime. That’s where I learned production pressure.',
    robotAction: 'walk',
  },
  {
    id: 'santosh',
    era: '2026 · Chennai',
    title: 'Santosh Electricals — ₹4,00,000 in 10 days',
    body:
      'Took a 15-year Sowcarpet electrical wholesaler online: 2,000+ SKUs, 14 authorised brands, B2B quote engine, WhatsApp BoQ flow, dealer pages, free trade calculators, full local SEO. Result: ₹4L organic revenue in the first 10 days (~10% margin for the client) — before any paid marketing.',
    link: { label: 'santoshelectric.com', href: 'https://santoshelectric.com' },
    robotAction: 'point',
  },
  {
    id: 'zerotheory',
    era: 'Now',
    title: 'ZeroTheory AI Pvt Ltd',
    body:
      'My company. A production AI platform: Next.js on Vercel, Supabase + pgvector, Razorpay + GST billing, n8n automations, multi-provider AI waterfall (local-first routing with cloud fallback) — shipped with real security hardening, auth and rate limits.',
    link: { label: 'zerotheory.ai', href: 'https://zerotheory.ai' },
    robotAction: 'build',
  },
  {
    id: 'security',
    era: 'R&D',
    title: 'Securing the agentic future',
    body:
      'TripWire — 5-layer security system for AI agent infrastructure, built for Microsoft’s agentic-security hackathon. Plus Voca and ProofPay. I build for the world where AI agents transact — and someone has to keep that safe.',
    robotAction: 'shield',
  },
] as const;

export const services = [
  {
    title: 'Business websites that sell',
    body: 'Not brochures — revenue systems. Catalogue, quote flows, WhatsApp funnels, local SEO. Proven: ₹4L in 10 days for a wholesaler.',
    icon: 'storefront',
  },
  {
    title: 'AI agents & automation',
    body: 'Agent fleets, n8n pipelines, AI waterfalls that cut model costs, retrieval over your own data. Production-grade, not demos.',
    icon: 'agent',
  },
  {
    title: 'Platforms & systems design',
    body: 'Full products: auth, payments (Razorpay + GST), databases, security hardening, deployment. From schema to live traffic.',
    icon: 'platform',
  },
] as const;

export const credentials = [
  'AMD Developer Hackathon — San Francisco on-site (approved)',
  'Aspire Leaders Program — Harvard (accepted, Cohort 2 · 2026)',
  'The Billion Dollar Build — Perplexity 8-week company build',
  'Google Cloud Gen AI Academy APAC — Gemini on Vertex AI',
  'AI for Bharat — HackerEarth',
  'Microsoft agentic-security hackathon — TripWire',
  'IIT Roorkee AI/ML Program — Intellipaat',
] as const;

export const stack = {
  frontend: ['Next.js', 'React', 'React Native / Expo', 'Three.js / R3F', 'GSAP'],
  backend: ['Supabase', 'pgvector', 'PostgreSQL', 'Node.js', 'Edge functions'],
  ai: ['Claude API', 'Gemini', 'Groq', 'Ollama (local-first routing)', 'RAG / embeddings'],
  ops: ['Vercel', 'n8n', 'Razorpay + GST', 'Git CI', 'Security hardening'],
} as const;

/** Lead form field definitions — validated on both client and server. */
export const leadFields = [
  { name: 'name', label: 'Your name', type: 'text', required: true, max: 80 },
  { name: 'company', label: 'Company / business', type: 'text', required: true, max: 120 },
  { name: 'designation', label: 'Your role', type: 'text', required: false, max: 80 },
  { name: 'location', label: 'City / location', type: 'text', required: true, max: 80 },
  { name: 'whatsapp', label: 'WhatsApp number', type: 'tel', required: true, max: 20 },
  { name: 'email', label: 'Email', type: 'email', required: true, max: 120 },
  {
    name: 'problem',
    label: 'What problem is your business facing?',
    type: 'textarea',
    required: true,
    max: 2000,
    placeholder:
      'e.g. "We have no online presence and lose orders to competitors" — describe it in your own words. I read every one and reply personally.',
  },
] as const;
