/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
        table.string('title_model').nullable(); // model used for generating conversation titles
        table.foreign('title_model').references('uuid').inTable('models').onDelete('SET NULL');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
        table.dropColumn('title_model');
    });
};
