import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../lib/db/schema';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = postgres(url);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding…');

  const [group] = await db
    .insert(schema.groups)
    .values({ name: 'how-we-agree', slug: 'how-we-agree' })
    .onConflictDoNothing()
    .returning();

  if (!group) {
    console.log('Group already exists — skipping deliberation seed.');
    process.exit(0);
  }

  console.log(`Group created: ${group.id}`);

  const [deliberation] = await db
    .insert(schema.deliberations)
    .values({
      groupId: group.id,
      question: 'What do we think we owe to the people who will come after us?',
    })
    .returning();

  console.log(`Deliberation created: ${deliberation.id}`);
  console.log('Done.');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
