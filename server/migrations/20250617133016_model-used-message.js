/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('messages', (table) => {
        table.string('model_uuid').nullable();
        table.foreign('model_uuid').references('uuid').inTable('models').onDelete('SET NULL');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('messages', (table) => {
        table.dropColumn('model_uuid');
    });
};
