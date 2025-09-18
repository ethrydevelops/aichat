/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    return knex.schema
        .dropTableIfExists("sessions")
        .then(() => {
            return knex.schema.createTable("profiles", (table) => {
                table.string("clerk_id").primary(); // Clerk's user.id
                table.string("username").unique();  // optional
                table.string("email").unique();     // optional
                table.timestamps(true, true);
            });
        })
        .then(() => {
        return knex.schema.alterTable("models", (table) => {
            table.dropForeign("owner_uuid");
            table.dropColumn("owner_uuid");
            table.string("owner_clerk_id")
                .nullable()
                .references("clerk_id")
                .inTable("profiles")
                .onDelete("CASCADE");
        });
        })
        .then(() => {
            return knex.schema.dropTableIfExists("users");
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .createTable("users", (table) => {
            table.uuid("uuid").primary();
            table.string("username").notNullable().unique();
            table.string("email").notNullable().unique();
            table.string("password_hash").notNullable();
            table.timestamps(true, true);
        })
        .then(() => {
            return knex.schema.createTable("sessions", (table) => {
                table.uuid("uuid").primary();
                table.uuid("user_uuid").notNullable().references("uuid").inTable("users").onDelete("CASCADE");
                table.string("token_hash").notNullable().unique();
                table.timestamps(true, true);
            });
        })
        .then(() => {
            return knex.schema.alterTable("models", (table) => {
                table.dropForeign("owner_clerk_id");
                table.dropColumn("owner_clerk_id");
                table.uuid("owner_uuid").nullable().references("uuid").inTable("users").onDelete("CASCADE");
            });
        })
        .then(() => {
            return knex.schema.dropTableIfExists("profiles");
        });
};
