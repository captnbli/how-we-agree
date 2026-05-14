import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const member = await getSession();
  if (!member) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const deliberationId = typeof body?.deliberationId === 'string' ? body.deliberationId : null;
  const text = typeof body?.body === 'string' ? body.body.trim() : null;

  if (!deliberationId || !text) {
    return NextResponse.json({ error: 'deliberationId and body required' }, { status: 400 });
  }

  const [post] = await db
    .insert(posts)
    .values({ deliberationId, memberId: member.id, body: text })
    .returning();

  return NextResponse.json(post);
}
