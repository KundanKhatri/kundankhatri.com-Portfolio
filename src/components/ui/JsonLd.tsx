export function JsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://kundankhatri.com/#person',
        name: 'Kundan Khatri',
        url: 'https://www.kundankhatri.com',
        email: 'mailto:kundanlm10@gmail.com',
        jobTitle: 'Founder & AI Systems Engineer',
        worksFor: {
          '@type': 'Organization',
          name: 'ZeroTheory AI Pvt Ltd',
          url: 'https://zerotheory.ai',
          founder: { '@id': 'https://kundankhatri.com/#person' },
          foundingLocation: { '@type': 'Place', name: 'Bengaluru, India' },
        },
        knowsAbout: [
          'AI agents', 'Web development', 'System design', 'Next.js', 'React Native',
          'Supabase', 'Business automation', 'E-commerce',
        ],
        award: [
          'AMD Developer Hackathon — San Francisco on-site (approved)',
          'Aspire Leaders Program — Harvard (accepted, Cohort 2 · 2026)',
          'The Billion Dollar Build — Perplexity 8-week company build',
          'Google Cloud Gen AI Academy APAC — Gemini on Vertex AI',
          'AI for Bharat — HackerEarth',
          'Microsoft agentic-security hackathon — TripWire',
          'IIT Roorkee AI/ML Program — Intellipaat',
        ],
        sameAs: ['https://zerotheory.ai', 'https://santoshelectric.com', 'https://focusaddict.com'],
      },
      {
        '@type': 'ProfessionalService',
        '@id': 'https://kundankhatri.com/#service',
        name: 'Kundan Khatri — Business Websites, AI Agents & Platforms',
        provider: { '@id': 'https://kundankhatri.com/#person' },
        serviceType: ['Business website development', 'AI agents & automation', 'Platform & systems engineering'],
        areaServed: [{ '@type': 'Country', name: 'India' }, 'Worldwide (remote)'],
        description: 'Production-grade business websites, AI agent systems and platforms. Case study: ₹4,00,000 organic revenue in 10 days for a Chennai electrical wholesaler.',
        url: 'https://kundankhatri.com',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Business websites that sell',
                description: 'Not brochures — revenue systems. Catalogue, quote flows, WhatsApp funnels, local SEO.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'AI agents & automation',
                description: 'Agent fleets, n8n pipelines, AI waterfalls, retrieval over your own data.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Platforms & systems design',
                description: 'Full products: auth, payments (Razorpay + GST), databases, security hardening, deployment.',
              },
            },
          ],
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
