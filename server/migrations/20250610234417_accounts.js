/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('accounts', (table) => {
        table.string('uuid').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        
        table.timestamps(true, true);
    })
    .createTable('sessions', (table) => {
        table.string('sid').primary();
        table.string('session_token').notNullable().unique();

        table.string('account_id').unsigned().notNullable();
        table.foreign('account_id').references('uuid').inTable('accounts').onDelete('CASCADE');

        table.timestamps(true, true);
    })
    .createTable('models', (table) => {
        table.string("name").notNullable();
        table.string("uuid").primary();

        table.string("url").notNullable(); // url of the model, e.g., "http://localhost:11434/api/chat"
        table.string("model").notNullable(); // model name in request, e.g., "gpt-3.5-turbo"

        table.string("authorization").nullable();

        table.string("account_id").notNullable(); // owner of the model
        table.foreign("account_id").references("uuid").inTable("accounts").onDelete("CASCADE");

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('sessions')
        .dropTableIfExists('accounts')
        .dropTableIfExists('models');
};
