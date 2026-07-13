'use client';

/** Browser TTS with a Sherlock-leaning British voice. Zero dependencies —
 *  quality tracks the device (excellent on Apple, decent elsewhere). */
class Voice {
  private preferred: SpeechSynthesisVoice | null = null;

  private pick() {
    if (this.preferred || typeof speechSynthesis === 'undefined') return;
    const voices = speechSynthesis.getVoices();
    this.preferred =
      voices.find((v) => v.name === 'Daniel') ??
      voices.find((v) => v.lang === 'en-GB' && v.localService) ??
      voices.find((v) => v.lang === 'en-GB') ??
      voices.find((v) => v.lang.startsWith('en')) ??
      null;
  }

  speak(text: string, onState?: (speaking: boolean) => void) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    this.pick();
    const u = new SpeechSynthesisUtterance(text);
    if (this.preferred) u.voice = this.preferred;
    u.rate = 1.04;
    u.pitch = 0.92;
    const setSpeaking = (speaking: boolean) => {
      onState?.(speaking);
      window.dispatchEvent(new CustomEvent('kk-speaking', { detail: speaking }));
    };
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }

  stop() {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  }
}

export const voice = new Voice();
// Voice list loads async in Chrome; warm the cache when it arrives.
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => void speechSynthesis.getVoices();
}
