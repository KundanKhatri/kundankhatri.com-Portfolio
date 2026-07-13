'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { hero, chapters, services, credentials, stack, site } from '@/data/content';
import { useSmoothScroll, bindScrollState } from '@/lib/useScrollProgress';
import { Chapter } from '@/components/ui/Chapter';
import { LeadForm } from '@/components/ui/LeadForm';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { sound } from '@/lib/sound';

const Experience = dynamic(
  () => import('@/components/three/Experience').then((m) => m.Experience),
  { ssr: false },
);

export default function Home() {
  useSmoothScroll();
  useEffect(() => bindScrollState(chapters.length + 2), []);

  return (
    <>
      <Experience />
      <SoundToggle />
      <main className="content">
        {/* HERO */}
        <section className="section" style={{ minHeight: '100vh', justifyContent: 'center' }}>
          <p className="eyebrow">Kundan Khatri · ZeroTheory AI Pvt Ltd</p>
          <h1>{hero.headline}</h1>
          <p className="lede">{hero.sub}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.2rem', flexWrap: 'wrap' }}>
            {hero.ctas.map((c) => (
              <a
                key={c.label}
                href={c.target}
                className={`btn ${c.kind === 'client' ? 'primary' : ''}`}
                onMouseEnter={() => sound.play('hover')}
                onClick={() => sound.play('click')}
              >
                {c.label}
              </a>
            ))}
          </div>
          <p style={{ marginTop: '4rem', color: 'var(--muted)', fontSize: '.85rem' }}>scroll ↓ — he&apos;s with you the whole way</p>
        </section>

        {/* STORY CHAPTERS — avatar poses through these */}
        {chapters.map((ch, i) => (
          <Chapter
            key={ch.id}
            id={ch.id}
            era={ch.era}
            title={ch.title}
            body={ch.body}
            link={'link' in ch ? (ch.link as { label: string; href: string }) : undefined}
            align={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}

        {/* SERVICES */}
        <section id="work" className="section">
          <p className="eyebrow">What I do for businesses</p>
          <h2>Hire the outcome, not the hours.</h2>
          <div style={{ display: 'grid', gap: '1.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: '2.4rem' }}>
            {services.map((s) => (
              <div
                key={s.title}
                onMouseEnter={() => sound.play('hover')}
                style={{ padding: '1.8rem', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
              >
                <h3 style={{ fontSize: '1.2rem', marginBottom: '.7rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--muted)', lineHeight: 1.6, fontSize: '.95rem' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CREDENTIALS */}
        <section className="section">
          <p className="eyebrow">Programs · Competitions · Recognition</p>
          <h2>Proof I show up where it&apos;s hardest.</h2>
          <ul style={{ marginTop: '2rem', listStyle: 'none', display: 'grid', gap: '.8rem' }}>
            {credentials.map((c) => (
              <li key={c} style={{ padding: '1rem 1.3rem', borderLeft: '2px solid var(--accent)', background: 'rgba(255,255,255,0.02)', color: 'var(--muted)' }}>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* STACK */}
        <section className="section">
          <p className="eyebrow">Tools I ship with</p>
          <h2>Production stack, end to end.</h2>
          <div style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '2rem' }}>
            {Object.entries(stack).map(([k, items]) => (
              <div key={k}>
                <h3 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--accent)', marginBottom: '.8rem' }}>{k}</h3>
                {items.map((t) => (
                  <p key={t} style={{ color: 'var(--muted)', fontSize: '.92rem', padding: '.25rem 0' }}>{t}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="section" style={{ paddingBottom: '8rem' }}>
          <p className="eyebrow">Tell me your problem</p>
          <h2>Your business has a bottleneck.<br />I build the system that removes it.</h2>
          <p className="lede" style={{ marginBottom: '2.4rem' }}>
            Describe the problem in your own words — no tech language needed. I reply personally within 24 hours.
          </p>
          <LeadForm />
          <p style={{ marginTop: '3.5rem', color: 'var(--muted)', fontSize: '.85rem' }}>
            {site.name} · {site.email} · 3D avatar generated with Meshy AI (CC BY 4.0)
          </p>
        </section>
      </main>
    </>
  );
}
