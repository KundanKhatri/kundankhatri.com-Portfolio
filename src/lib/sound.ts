'use client';
import { Howl } from 'howler';

/** Central sound manager. On by default; browsers keep the audio context locked
 *  until the first user gesture, so nothing plays on load — sounds fire from the
 *  first click/hover onward. The toggle acts as a mute. */
class SoundManager {
  private enabled = true;
  private sounds: Record<string, Howl> = {};
  private lastHoverAt = 0;

  init() {
    if (Object.keys(this.sounds).length) return;
    const make = (src: string, volume = 0.35) => new Howl({ src: [src], volume, preload: true });
    this.sounds = {
      click: make('/sounds/click.wav', 0.5),
      hover: make('/sounds/hover.wav', 0.2),
      whoosh: make('/sounds/whoosh.wav', 0.3),
      boot: make('/sounds/boot.wav', 0.45),
      tap: make('/sounds/tap.wav', 0.5),
      success: make('/sounds/success.wav', 0.4),
      transition: make('/sounds/transition.wav', 0.3),
    };
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.init();
  }
  get isEnabled() { return this.enabled; }

  play(name: 'click' | 'hover' | 'whoosh' | 'boot' | 'tap' | 'success' | 'transition') {
    if (!this.enabled) return;
    if (!Object.keys(this.sounds).length) this.init(); // lazy-init on first gesture

    if (name === 'hover') {
      const now = performance.now();
      if (now - this.lastHoverAt < 80) return; // machine-gun guard against rapid pointer moves
      this.lastHoverAt = now;
    }

    const howl = this.sounds[name];
    if (!howl) return;
    const id = howl.play();
    // per-play pitch/volume jitter — identical repeats read as flat, this is what makes it feel alive
    howl.rate(0.94 + Math.random() * 0.14, id);
    howl.volume((howl.volume() as number) * (0.9 + Math.random() * 0.2), id);
  }
}

export const sound = new SoundManager();
