/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("users", (table) => {
        table.uuid("uuid").primary();
        table.string("username");
        table.string("email").notNullable().unique();
        table.string("password").notNullable();
        table.timestamps(true, true);
    })
    .createTable("sessions", (table) => {
        table.uuid("uuid").primary();
        table.uuid("user_uuid").notNullable().references("uuid").inTable("users").onDelete("CASCADE");
        table.string("token_hash").notNullable().unique();
        table.timestamps(true, true);
    })
    .createTable("models", (table) => {
        table.uuid("uuid").primary();
        
        table.string("name").notNullable();
        table.text("description");

        table.uuid("owner_uuid").nullable().references("uuid").inTable("users").onDelete("CASCADE");

        // default instance models should have both set to true, but users' models should have both false:
        table.boolean("is_public").defaultTo(false); // if instance provides model for free
        table.boolean("conn_private").defaultTo(false); // if connection info is not shared with user(s) (i.e, API key, url)

        table.string("api_url").notNullable();
        table.text("api_authorization");
        table.boolean("is_encrypted").defaultTo(false);
        table.string("api_model"); // e.g., "gpt-4o", "gpt-3.5-turbo", "claude-2"

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists("sessions")
        .dropTableIfExists("models")
        .dropTableIfExists("users");
};
