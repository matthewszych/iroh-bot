import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.text('user_id').notNullable();
    table.text('guild_id').notNullable();
    table.text('element');
    table.integer('xp').defaultTo(0);
    table.integer('level').defaultTo(1);
    table.integer('wisdom_received').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.primary(['user_id', 'guild_id']);
  });

  await knex.schema.createTable('wisdom_log', (table) => {
    table.increments('id').primary();
    table.text('user_id').notNullable();
    table.text('guild_id').notNullable();
    table.text('quote').notNullable();
    table.timestamp('timestamp').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wisdom_log');
  await knex.schema.dropTableIfExists('users');
}
