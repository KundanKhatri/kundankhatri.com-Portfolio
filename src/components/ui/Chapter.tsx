'use client';
import { useEffect, useRef, useState } from 'react';
import { sound } from '@/lib/sound';

type Props = {
  id: string;
  era: string;
  title: string;
  body: string;
  link?: { label: string; href: string };
  align?: 'left' | 'right';
};

/** A story section. Reveals on scroll; expandable detail button plays a click. */
export function Chapter({ id, era, title, body, link, align = 'left' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
        textAlign: align === 'right' ? 'right' : 'left',
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(48px)',
        transition: 'opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1)',
      }}
    >
      <p className="eyebrow">{era}</p>
      <h2>{title}</h2>
      <p className="lede" style={{ marginLeft: align === 'right' ? 'auto' : undefined }}>{body}</p>
      {link && (
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
