/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
        table.string('last_used_model').nullable(); /* last used model */
        table.foreign('last_used_model').references('uuid').inTable('models').onDelete('SET NULL');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('accounts', (table) => {
        table.dropColumn('last_used_model');
    });
};
