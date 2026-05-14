import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { members, magicLinkTokens } from '@/lib/db/schema';
import { consoleEmailSender } from '@/lib/email/console';

const TOKEN_TTL_MINUTES = 15;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : null;

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  let [member] = await db.select().from(members).where(eq(members.email, email)).limit(1);
  if (!member) {
    [member] = await db.insert(members).values({ email }).returning();
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await db.insert(magicLinkTokens).values({ email, token, expiresAt });

  const base = process.env.APP_URL ?? 'http://localhost:3000';
  const link = `${base}/api/auth/verify?token=${token}`;

  await consoleEmailSender.send(
    email,
    'Sign in to how-we-agree',
    `Your sign-in link:\n\n${link}\n\nExpires in ${TOKEN_TTL_MINUTES} minutes. Use it once.`,
  );

  // Always 200 — never confirm or deny membership by email
  return NextResponse.json({ ok: true });
}
