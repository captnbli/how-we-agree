'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface Post {
  id: string;
  body: string;
  createdAt: string;
  memberName: string | null;
  memberEmail: string;
}

interface Props {
  member: { id: string; name: string | null; email: string };
  deliberation: { id: string; question: string };
  initialPosts: Post[];
}

export default function DeliberationView({ member, deliberation, initialPosts }: Props) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [crystallisation, setCrystallisation] = useState<string | null>(null);
  const [crystallising, setCrystallising] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = member.name ?? member.email.split('@')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliberationId: deliberation.id, body: body.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to post');
      return;
    }

    setBody('');
    setCrystallisation(null);
    startTransition(() => router.refresh());
  }

  async function handleCrystallise() {
    if (initialPosts.length === 0) return;
    setCrystallising(true);
    setError(null);
    try {
      const res = await fetch('/api/crystallise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliberationId: deliberation.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Server error');
      setCrystallisation(data.crystallisation);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCrystallising(false);
    }
  }

  return (
    <div className="deliberation">
      <h2 className="deliberation-question">{deliberation.question}</h2>

      <div className="responses">
        {initialPosts.length === 0 ? (
          <p className="muted">No posts yet.</p>
        ) : (
          initialPosts.map((post) => (
            <div key={post.id} className="response">
              <span className="response-participant">
                {post.memberName ?? post.memberEmail.split('@')[0]}
              </span>
              <p className="response-text">{post.body}</p>
            </div>
          ))
        )}
      </div>

      <form className="response-form" onSubmit={handleSubmit}>
        <label>
          <span>Your post — {displayName}</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Say what you actually think."
            disabled={isPending}
          />
        </label>
        <div>
          <button type="submit" disabled={!body.trim() || isPending}>
            {isPending ? 'Posting…' : 'Add to thread'}
          </button>
        </div>
      </form>

      {initialPosts.length > 0 && (
        <div className="crystallisation-zone">
          <button
            className="crystallise-btn"
            onClick={handleCrystallise}
            disabled={crystallising}
          >
            {crystallising ? 'Reading the thread…' : "What's emerging?"}
          </button>

          {error && <p className="status status--error">{error}</p>}

          {crystallisation && !crystallising && (
            <div className="crystallisation">
              <span className="crystallisation-label">What I'm hearing</span>
              <p>{crystallisation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
