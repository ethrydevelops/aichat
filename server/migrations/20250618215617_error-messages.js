exports.up = async function(knex) {
    await knex.schema.alterTable('messages', function(table) {
        table.dropColumn('role');
    });
    
    await knex.schema.alterTable('messages', function(table) {
        table.enu('role', ['user', 'assistant', 'system', 'error']).notNullable();
    });
};
  
exports.down = async function(knex) {
    await knex.schema.alterTable('messages', function(table) {
        table.dropColumn('role');
    });
    
    await knex.schema.alterTable('messages', function(table) {
        table.enu('role', ['user', 'assistant', 'system']).notNullable();
    });
};
