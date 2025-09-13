exports.up = async function(knex) {
    await knex.schema.alterTable('messages', (table) => {
        table.text('content_tmp');
    });
  
    await knex.raw(`
        UPDATE messages
        SET content_tmp = content
    `);
  
    await knex.schema.alterTable('messages', (table) => {
        table.dropColumn('content');
    });
  
    await knex.schema.alterTable('messages', (table) => {
        table.text('content');
    });
  
    await knex.raw(`
        UPDATE messages
        SET content = content_tmp
    `);
  
    await knex.schema.alterTable('messages', (table) => {
        table.dropColumn('content_tmp');
    });
};
  
exports.down = async function(knex) {
    await knex.schema.alterTable('messages', (table) => {
        table.string('content_tmp');
    });
  
    await knex.raw(`
        UPDATE messages
        SET content_tmp = content
    `);
  
    await knex.schema.alterTable('messages', (table) => {
        table.dropColumn('content');
    });
  
    await knex.schema.alterTable('messages', (table) => {
        table.string('content');
    });
  
    await knex.raw(`
        UPDATE messages
        SET content = content_tmp
    `);
  
    await knex.schema.alterTable('messages', (table) => {
        table.dropColumn('content_tmp');
    });
};  