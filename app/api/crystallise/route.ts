import { NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { deliberations, members, posts } from '@/lib/db/schema';
import { claudeCrystalliser } from '@/lib/crystallise/claude';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  const member = await getSession();
  if (!member) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const deliberationId = typeof body?.deliberationId === 'string' ? body.deliberationId : null;

  if (!deliberationId) {
    return NextResponse.json({ error: 'deliberationId required' }, { status: 400 });
  }

  const [deliberation] = await db
    .select()
    .from(deliberations)
    .where(eq(deliberations.id, deliberationId))
    .limit(1);

  if (!deliberation) {
    return NextResponse.json({ error: 'Deliberation not found' }, { status: 404 });
  }

  const thread = await db
    .select({ body: posts.body, memberName: members.name, memberEmail: members.email })
    .from(posts)
    .innerJoin(members, eq(posts.memberId, members.id))
    .where(eq(posts.deliberationId, deliberationId))
    .orderBy(asc(posts.createdAt));

  if (thread.length === 0) {
    return NextResponse.json({ error: 'No posts yet' }, { status: 400 });
  }

  const summaries = thread.map((p) => ({
    participant: p.memberName ?? p.memberEmail.split('@')[0],
    body: p.body,
  }));

  const crystallisation = await claudeCrystalliser.crystallise(deliberation.question, summaries);
  return NextResponse.json({ crystallisation });
}
