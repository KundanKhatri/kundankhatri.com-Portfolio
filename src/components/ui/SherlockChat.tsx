'use client';
import { useEffect, useRef, useState } from 'react';
import { sound } from '@/lib/sound';
import { voice } from '@/lib/voice';

type Msg = { role: 'user' | 'assistant'; content: string };

const GREETING =
  'Ah — a visitor. I observe you’ve found your way to Kundan’s case files. Tell me about your business, and I’ll deduce precisely where it’s bleeding money.';

/** Keyword-matched deductions when no API key is configured server-side. */
const SCRIPTED: [RegExp, string][] = [
  [/websit|online|presence|store|shop/i, 'Elementary. No revenue-grade web presence — the same condition Santosh Electricals arrived in. Kundan’s remedy produced ₹4,00,000 in organic revenue in ten days. Leave your details in the mission brief below; he replies within 24 hours.'],
  [/ai|agent|automat|bot/i, 'You suspect automation could carry more of your load. Correct suspicion. Kundan builds production AI agents — not demos — with security hardening included. Describe the workflow in the mission brief and he’ll scope it personally.'],
  [/price|cost|charge|fee|budget|rate/i, 'A man who asks the price before the diagnosis. Kundan prices outcomes, not hours — the ₹4L-in-10-days kind of outcome. State your problem in the form below; the scope, and the number, follow within 24 hours.'],
  [/lead|market|seo|traffic|customer|sale/i, 'Losing customers you never meet — the invisible wound. Local SEO, quote engines and WhatsApp funnels are precisely how Kundan turned a 15-year wholesaler into ₹4L of organic revenue in 10 days. The mission brief below starts the cure.'],
  [/hi|hello|hey|who/i, 'Digital Kundan, at your service — the deductive double of a founder-engineer who ships production systems. Now: what does your business do, and where does it hurt?'],
];
const SCRIPTED_FALLBACK =
  'Interesting. The details escape me in this offline state — but Kundan misses nothing. Put it in the mission brief below and he’ll reply personally within 24 hours.';

function scriptedReply(text: string): string {
  for (const [re, reply] of SCRIPTED) if (re.test(text)) return reply;
  return SCRIPTED_FALLBACK;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function SherlockChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  // Track TTS state so the UI can show when Digital Kundan is literally talking.
  useEffect(() => {
    const onSpeak = (e: Event) => setSpeaking((e as CustomEvent<boolean>).detail);
    window.addEventListener('kk-speaking', onSpeak);
    return () => window.removeEventListener('kk-speaking', onSpeak);
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open]);

  function speak(text: string) {
    if (!sound.isEnabled) return;
    voice.speak(text, (speaking) => window.dispatchEvent(new CustomEvent('kk-speaking', { detail: speaking })));
  }

  function openChat() {
    setOpen(true);
    sound.play('boot');
    if (msgs.length === 0) {
      setMsgs([{ role: 'assistant', content: GREETING }]);
      speak(GREETING);
    }
  }

  async function send(text: string) {
    const clean = text.trim().slice(0, 1200);
    if (!clean || busy) return;
    sound.play('click');
    const next: Msg[] = [...msgs, { role: 'user', content: clean }];
    setMsgs(next);
    setInput('');
    setBusy(true);
    let reply: string;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const json = await res.json();
      reply = json.reply || scriptedReply(clean);
    } catch {
      reply = scriptedReply(clean);
    }
    setMsgs((m) => [...m, { role: 'assistant', content: reply }]);
    sound.play('tap');
    speak(reply);
    setBusy(false);
  }

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      void send(transcript);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    sound.play('tap');
    rec.start();
  }

  const hasMic = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;

  if (!open) {
    return (
      <button
        onClick={openChat}
        onMouseEnter={() => sound.play('hover')}
        onPointerDown={() => sound.play('tap')}
        aria-label="Talk to Digital Kundan"
        className="touch-ripple"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 60,
          padding: '0.9rem 1.4rem', borderRadius: 4, cursor: 'pointer',
          background: 'rgba(212, 175, 55, 0.08)', border: '1px solid var(--accent)',
          color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '.8rem',
          letterSpacing: '.14em', textTransform: 'uppercase',
          boxShadow: '0 0 32px rgba(212, 175, 55, 0.18)',
          transition: 'transform .15s, box-shadow .15s, background .15s',
        }}
      >
        ▸ Talk to Digital Kundan
      </button>
    );
  }

  return (
    <aside
      className="hud"
      role="dialog"
      aria-label="Digital Kundan chat"
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 60,
        width: 'min(400px, calc(100vw - 32px))', height: 'min(520px, 70vh)',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(5,5,8,0.92)', backdropFilter: 'blur(12px)',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.72rem', letterSpacing: '.2em', color: 'var(--accent)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <span
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: speaking ? 'var(--accent)' : '#d4af37',
              boxShadow: speaking ? '0 0 12px var(--accent)' : 'none',
              animation: speaking ? 'pulse-dot 1s ease-in-out infinite' : 'none',
            }}
          />
          Digital Kundan — {speaking ? 'speaking' : busy ? 'deducing' : 'online'}
        </span>
        <button onClick={() => { setOpen(false); voice.stop(); }} aria-label="Close chat" style={{ background: 'none', border: 0, color: 'var(--muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
      </header>

      <div ref={logRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.1rem', display: 'grid', gap: '.8rem', alignContent: 'start' }}>
        {msgs.map((m, i) => (
          <p
            key={i}
            style={{
              justifySelf: m.role === 'user' ? 'end' : 'start',
              maxWidth: '85%', padding: '.65rem .9rem', fontSize: '.88rem', lineHeight: 1.5,
              background: m.role === 'user' ? 'rgba(212, 175, 55, 0.10)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${m.role === 'user' ? 'var(--hud-line)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 4, color: 'var(--fg)',
            }}
          >
            {m.content}
          </p>
        ))}
        {busy && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '.78rem' }}>deducing…</p>}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); void send(input); }}
        style={{ display: 'flex', gap: '.5rem', padding: '.8rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your business problem…"
          maxLength={1200}
          style={{
            flex: 1, padding: '.7rem .9rem', borderRadius: 4, fontSize: '.88rem',
            border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: 'var(--fg)',
          }}
        />
        {hasMic && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label={listening ? 'Stop listening' : 'Speak your problem'}
            style={{
              padding: '0 .9rem', borderRadius: 4, cursor: 'pointer',
              border: `1px solid ${listening ? 'var(--accent)' : 'rgba(255,255,255,0.14)'}`,
              background: listening ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255,255,255,0.04)',
              color: listening ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {listening ? '◉' : '🎙'}
          </button>
        )}
        <button type="submit" disabled={busy} className="btn primary" style={{ padding: '.7rem 1rem', fontSize: '.85rem' }}>
          ▸
        </button>
      </form>
    </aside>
  );
}
