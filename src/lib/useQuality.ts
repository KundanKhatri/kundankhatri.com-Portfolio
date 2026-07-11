'use client';
import { useEffect, useState } from 'react';

/**
 * Render-quality tier for the 3D scene, chosen from device capability.
 * - 'high'   : full scene (HDR env, shadows, high DPR) — capable desktops.
 * - 'low'    : robot kept, but HDR env / shadows / extra lights dropped — the
 *              real mobile-LCP costs — plus lower DPR. Phones & tablets.
 * - 'static' : no WebGL context at all; an intentional CSS backdrop instead.
 *              Reduced-motion, Save-Data, no-WebGL, or <=2GB devices.
 */
export type Quality = 'high' | 'low' | 'static';

function detect(): Quality {
  if (typeof window === 'undefined') return 'static';
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const saveData = nav.connection?.saveData === true;
  const mem = nav.deviceMemory ?? 8;

  const noWebGL = (() => {
    try {
      const c = document.createElement('canvas');
      return !(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return true;
    }
  })();

  if (reduce || noWebGL || saveData || mem <= 2) return 'static';

  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const small = window.innerWidth < 820;
  if (coarse || small || mem <= 4) return 'low';
  return 'high';
}

export function useQuality(): Quality {
  // SSR-safe: start conservative, upgrade after mount (also defers 3D past first paint).
  const [quality, setQuality] = useState<Quality>('static');
  useEffect(() => {
    setQuality(detect());
  }, []);
  return quality;
}
