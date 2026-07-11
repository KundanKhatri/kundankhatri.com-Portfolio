'use client';
import { useState } from 'react';
import { sound } from '@/lib/sound';

export function SoundToggle() {
  const [on, setOn] = useState(true);
  return (
    <button
      className="btn"
      style={{ position: 'fixed', top: '1.2rem', right: '1.2rem', zIndex: 50, padding: '0.6rem 1rem' }}
      aria-pressed={on}
      aria-label={on ? 'Mute sounds' : 'Enable sounds'}
      onClick={() => {
        const next = !on;
        setOn(next);
        sound.setEnabled(next);
        if (next) sound.play('boot');
      }}
    >
      {on ? '🔊 sound on' : '🔇 sound off'}
    </button>
  );
}
