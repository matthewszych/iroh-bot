import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('favorite_teams', (table) => {
    table.text('user_id').notNullable();
    table.text('guild_id').notNullable();
    table.text('league').notNullable();
    table.text('team').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.primary(['user_id', 'guild_id', 'league']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('favorite_teams');
}
