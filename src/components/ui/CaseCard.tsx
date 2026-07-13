'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { sound } from '@/lib/sound';

type Props = { src: string; alt: string; url: string; domain: string };

/** Live-product screenshot in a browser frame, 3D-tilting toward the cursor. */
export function CaseCard({ src, alt, url, domain }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${y * -8}deg)`;
  }

  function onLeave() {
    if (ref.current) ref.current.style.transform = '';
  }

  return (
    <a
      ref={ref}
      className="case-card"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onMouseEnter={() => sound.play('hover')}
      onClick={() => sound.play('click')}
    >
      <span className="case-chrome"><i /><i /><i /><em>{domain}</em></span>
      <Image src={src} alt={alt} width={1200} height={750} loading="lazy" />
    </a>
  );
}
