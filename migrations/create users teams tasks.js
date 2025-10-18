exports.up = async function (knex) {
  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('teams', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.integer('creator_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    t.timestamps(true, true);
  });

  await knex.schema.createTable('memberships', (t) => {
    t.increments('id').primary();
    t.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.integer('team_id').unsigned().notNullable().references('id').inTable('teams').onDelete('CASCADE');
    t.string('role').defaultTo('member');
    t.unique(['user_id', 'team_id']);
    t.timestamps(true, true);
  });

  await knex.schema.createTable('tasks', (t) => {
    t.increments('id').primary();
    t.string('title').notNullable();
    t.text('description');
    t.integer('creator_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    t.integer('assignee_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    t.integer('team_id').unsigned().references('id').inTable('teams').onDelete('CASCADE');
    t.string('status').notNullable().defaultTo('todo');
    t.timestamp('due_at');
    t.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tasks');
  await knex.schema.dropTableIfExists('memberships');
  await knex.schema.dropTableIfExists('teams');
  await knex.schema.dropTableIfExists('users');
};
