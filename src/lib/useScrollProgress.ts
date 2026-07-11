'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Smooth scrolling via Lenis, synced with GSAP ScrollTrigger. */
export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}

/** Global scroll progress store (0..1 across the whole page) — read by the 3D scene each frame. */
export const scrollState = { progress: 0, velocity: 0, section: 0 };

export function bindScrollState(totalSections: number) {
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    scrollState.velocity = p - scrollState.progress;
    scrollState.progress = p;
    scrollState.section = Math.min(totalSections - 1, Math.floor(p * totalSections));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener('scroll', onScroll);
}
