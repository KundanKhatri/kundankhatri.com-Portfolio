'use client';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { hero, chapters, services, credentials, stack, site } from '@/data/content';
import { useSmoothScroll, bindScrollState } from '@/lib/useScrollProgress';
import { Chapter } from '@/components/ui/Chapter';
import { LeadForm } from '@/components/ui/LeadForm';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { SherlockChat } from '@/components/ui/SherlockChat';
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
      <SherlockChat />
      <main className="content grain">
        {/* HERO */}
        <section className="section" style={{ minHeight: '100vh', justifyContent: 'center' }}>
          <p className="hud-label">Kundan Khatri · ZeroTheory AI Pvt Ltd</p>
          <h1>{hero.headline}</h1>
          <p className="lede">{hero.sub}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.2rem', flexWrap: 'wrap' }}>
            {hero.ctas.map((c) => (
              <a
                key={c.label}
                href={c.target}
                className={`btn touch-ripple ${c.kind === 'client' ? 'primary' : ''}`}
                onMouseEnter={() => sound.play('hover')}
                onClick={() => sound.play('click')}
              >
                {c.label}
              </a>
            ))}
          </div>
          <p style={{ marginTop: '4rem', color: 'var(--muted)', fontSize: '.85rem' }}>scroll ↓ — he&apos;s with you the whole way</p>
        </section>

        {/* STORY CHAPTERS — quest log; avatar poses through these */}
        {chapters.map((ch, i) => (
          <Chapter
            key={ch.id}
            id={ch.id}
            era={ch.era}
            title={ch.title}
            body={ch.body}
            link={ch.id !== 'zerotheory' && 'link' in ch ? (ch.link as { label: string; href: string }) : undefined}
            align={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}

        {/* SERVICES — skill tree */}
        <section id="work" className="section">
          <p className="hud-label">Skill tree · What I do for businesses</p>
          <h2>Hire the outcome, not the hours.</h2>
          <div style={{ display: 'grid', gap: '1.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginTop: '2.4rem' }}>
            {services.map((s) => (
              <div key={s.title} className="hud skill touch-ripple" onMouseEnter={() => sound.play('hover')}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CREDENTIALS — achievements */}
        <section className="section">
          <p className="hud-label">Achievements unlocked</p>
          <h2>Proof I show up where it's hardest.</h2>
          <ul style={{ marginTop: '2rem', listStyle: 'none', display: 'grid', gap: '.8rem' }}>
            {credentials.map((c) => (
              <li key={c} className="achievement touch-ripple" onMouseEnter={() => sound.play('hover')}>{c}</li>
            ))}
          </ul>
        </section>

        {/* STACK */}
        <section className="section">
          <p className="hud-label">Loadout · Tools I ship with</p>
          <h2>Production stack, end to end.</h2>
          <div style={{ display: 'grid', gap: '1.2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '2rem' }}>
            {Object.entries(stack).map(([k, items]) => (
              <div key={k} className="hud skill touch-ripple" style={{ padding: '1.4rem' }}>
                <h3 style={{ fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--accent)', marginBottom: '.8rem' }}>{k}</h3>
                {items.map((t) => (
                  <p key={t} style={{ color: 'var(--muted)', fontSize: '.92rem', padding: '.25rem 0' }}>{t}</p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT — mission brief */}
        <section id="contact" className="section" style={{ paddingBottom: '8rem' }}>
          <p className="hud-label">Mission brief · Start a contract</p>
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
