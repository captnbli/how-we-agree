import { NextResponse } from 'next/server';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { magicLinkTokens, members } from '@/lib/db/schema';
import { createSession } from '@/lib/session';

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token = searchParams.get('token');

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/?error=${reason}`);

  if (!token) return fail('missing_token');

  const [row] = await db
    .select()
    .from(magicLinkTokens)
    .where(
      and(
        eq(magicLinkTokens.token, token),
        gt(magicLinkTokens.expiresAt, new Date()),
        isNull(magicLinkTokens.usedAt),
      ),
    )
    .limit(1);

  if (!row) return fail('invalid_token');

  await db
    .update(magicLinkTokens)
    .set({ usedAt: new Date() })
    .where(eq(magicLinkTokens.id, row.id));

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.email, row.email))
    .limit(1);

  if (!member) return fail('member_not_found');

  await createSession(member.id);
  return NextResponse.redirect(`${origin}/`);
}
