/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('messages', function(table) {
        table.enum('status', ['sent', 'generating', 'error', 'generated']).defaultTo('sent');
        table.text('error_message').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('messages', function(table) {
        table.dropColumn('status');
        table.dropColumn('error_message');
    });
};
