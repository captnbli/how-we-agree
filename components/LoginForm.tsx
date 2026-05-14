'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="card">
        <h2>Check your email</h2>
        <p className="muted">A sign-in link is on its way to {email}. It expires in 15 minutes.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Sign in</h2>
      <p className="muted">Enter your email and we'll send you a sign-in link.</p>
      <form onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={submitting}
            autoFocus
          />
        </label>
        <div>
          <button type="submit" disabled={!email.trim() || submitting}>
            {submitting ? 'Sending…' : 'Send sign-in link'}
          </button>
        </div>
        {error && <p className="status status--error">{error}</p>}
      </form>
    </div>
  );
}
