'use client';
import { Howl } from 'howler';

/** Central sound manager — muted by default, user opts in. */
class SoundManager {
  private enabled = false;
  private sounds: Record<string, Howl> = {};

  init() {
    if (Object.keys(this.sounds).length) return;
    const make = (src: string, volume = 0.35) => new Howl({ src: [src], volume, preload: true });
    this.sounds = {
      click: make('/sounds/click.wav', 0.5),
      hover: make('/sounds/hover.wav', 0.2),
      whoosh: make('/sounds/whoosh.wav', 0.3),
      boot: make('/sounds/boot.wav', 0.45),
    };
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.init();
  }
  get isEnabled() { return this.enabled; }

  play(name: 'click' | 'hover' | 'whoosh' | 'boot') {
    if (!this.enabled) return;
    this.sounds[name]?.play();
  }
}

export const sound = new SoundManager();
