'use client';
import { useState } from 'react';
import { leadFields } from '@/data/content';
import { sound } from '@/lib/sound';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export function LeadForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sound.play('click');
    setStatus('sending');
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Something went wrong');
      setStatus('ok');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  if (status === 'ok') {
    return (
      <div role="status" style={{ padding: '2rem', border: '1px solid var(--accent)', borderRadius: 16 }}>
        <h3 style={{ color: 'var(--accent)' }}>Got it. I read every message personally.</h3>
        <p className="lede" style={{ marginTop: '.6rem' }}>
          You&apos;ll hear from me on WhatsApp or email within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', maxWidth: 720 }}>
      {leadFields.map((f) => {
        const common = {
          name: f.name,
          id: f.name,
          required: f.required,
          maxLength: f.max,
          placeholder: 'placeholder' in f ? (f.placeholder as string) : undefined,
          style: {
            width: '100%',
            padding: '0.9rem 1rem',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--fg)',
            fontSize: '0.95rem',
          } as React.CSSProperties,
        };
        return (
          <div key={f.name} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
            <label htmlFor={f.name} style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '.4rem' }}>
              {f.label}{f.required && ' *'}
            </label>
            {f.type === 'textarea'
              ? <textarea {...common} rows={5} />
              : <input {...common} type={f.type} inputMode={f.type === 'tel' ? 'tel' : undefined} />}
          </div>
        );
      })}
      {/* Honeypot — bots fill it, humans never see it */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: 'absolute', left: '-9999px' }} />
      <div style={{ gridColumn: '1 / -1' }}>
        <button className="btn primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send it to Kundan →'}
        </button>
        {status === 'error' && <p role="alert" style={{ color: '#ff6b6b', marginTop: '.8rem' }}>{error}</p>}
      </div>
    </form>
  );
}
