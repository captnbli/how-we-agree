import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { deliberations, members, posts } from '@/lib/db/schema';
import { getSession } from '@/lib/session';
import DeliberationView from '@/components/DeliberationView';
import LoginForm from '@/components/LoginForm';

export default async function Page() {
  const member = await getSession();
  if (!member) return <LoginForm />;

  const [deliberation] = await db
    .select()
    .from(deliberations)
    .orderBy(asc(deliberations.createdAt))
    .limit(1);

  if (!deliberation) {
    return <p className="muted">No deliberation has been started. Run the seed script first.</p>;
  }

  const thread = await db
    .select({
      id: posts.id,
      body: posts.body,
      createdAt: posts.createdAt,
      memberName: members.name,
      memberEmail: members.email,
    })
    .from(posts)
    .innerJoin(members, eq(posts.memberId, members.id))
    .where(eq(posts.deliberationId, deliberation.id))
    .orderBy(asc(posts.createdAt));

  return (
    <DeliberationView
      member={{ id: member.id, name: member.name, email: member.email }}
      deliberation={{ id: deliberation.id, question: deliberation.question }}
      initialPosts={thread.map((p) => ({
        id: p.id,
        body: p.body,
        createdAt: p.createdAt.toISOString(),
        memberName: p.memberName,
        memberEmail: p.memberEmail,
      }))}
    />
  );
}
