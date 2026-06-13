import knex, { Knex } from 'knex';

export const db: Knex = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
  },
});

export async function migrate(): Promise<void> {
  await db.migrate.latest();
}
