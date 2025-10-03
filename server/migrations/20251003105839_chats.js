/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("conversations", (table) => {
        table.uuid("uuid").primary();
        table.uuid("user_uuid").index().notNullable().references("uuid").inTable("users").onDelete("CASCADE");
        table.string("title").notNullable().defaultTo("New Chat");
        table.timestamps(true, true);
    })
    .createTable("messages", (table) => {
        table.uuid("uuid").primary();
        table.uuid("conversation_uuid").index().notNullable().references("uuid").inTable("conversations").onDelete("CASCADE");
        table.text("content").notNullable();
        table.enum("role", ["user", "assistant", "system"]).notNullable();
        table.uuid("model_uuid").nullable().references("uuid").inTable("models").onDelete("SET NULL"); // model sent by OR model requested
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists("messages")
        .dropTableIfExists("conversations");
};
