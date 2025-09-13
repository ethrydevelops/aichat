/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('chats', (table) => {
        table.string('uuid').notNullable().primary();
        table.string('title').notNullable().defaultTo('New Chat');
        
        table.string('account_id').notNullable();
        table.foreign('account_id').references('uuid').inTable('accounts').onDelete('CASCADE');

        table.boolean('private').defaultTo(true).notNullable(); // if true, user has shared chat (other users can see it by url)
        
        table.timestamps(true, true);
    })
    .createTable('messages', (table) => {
        table.string('uuid').notNullable().primary();

        table.string('content').notNullable();

        table.string('chat_uuid').notNullable();
        table.foreign('chat_uuid').references('uuid').inTable('chats').onDelete('CASCADE');

        table.enum('role', ['user', 'assistant', 'system']).notNullable();

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('messages')
        .dropTableIfExists('chats');
};
