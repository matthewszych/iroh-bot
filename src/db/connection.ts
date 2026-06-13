import knex, { Knex } from 'knex';
import path from 'path';

export const db: Knex = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: path.join(__dirname, 'migrations'),
  },
});

export async function migrate(): Promise<void> {
  await db.migrate.latest();
}
