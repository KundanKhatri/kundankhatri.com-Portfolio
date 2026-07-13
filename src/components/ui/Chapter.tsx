'use client';
import { useEffect, useRef, useState } from 'react';
import { caseStudies } from '@/data/content';
import { CaseCard } from '@/components/ui/CaseCard';
import { sound } from '@/lib/sound';

type Props = {
  id: string;
  era: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
  align?: 'left' | 'right';
};

/** A story chapter rendered as a quest-log entry: PROBLEM/APPROACH/RESULT rows,
 *  XP-style stat numerals, and a browser-framed screenshot of the live product. */
export function Chapter({ id, era, title, body, link, align = 'left' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const cs = caseStudies[id];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          sound.play('transition');
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className="section"
      style={{
        marginLeft: align === 'right' ? 'auto' : undefined,
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(48px)',
        transition: 'opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <p className="hud-label">{era}</p>
      <h2>{title}</h2>

      {cs ? (
        <>
          <div className="quest">
            {cs.quest.map((q) => (
              <div key={q.label} className={`quest-row${q.label === 'RESULT' ? ' result' : ''}`}>
                <b>{q.label}</b>
                <span>{q.text}</span>
              </div>
            ))}
          </div>
          <div className="stats">
            {cs.stats.map((s) => (
              <div key={s.label} className="stat"><b>{s.value}</b><span>{s.label}</span></div>
            ))}
          </div>
          {cs.chips && (
            <div className="marquee" aria-label="Shows worked">
              <div className="marquee-track">
                {[...cs.chips, ...cs.chips].map((c, i) => <span key={i} className="chip">{c}</span>)}
              </div>
            </div>
          )}
          {cs.shot && <CaseCard {...cs.shot} />}
        </>
      ) : (
        <p className="lede">{body}</p>
      )}

      {link && !cs?.shot && (
        <p style={{ marginTop: '1.6rem' }}>
          <a
            className="btn"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => sound.play('hover')}
            onClick={() => sound.play('click')}
          >
            {link.label} ↗
          </a>
        </p>
      )}
    </section>
  );
}
