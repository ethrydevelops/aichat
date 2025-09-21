const fs = require("fs");
const path = require("path");

if(!fs.existsSync(path.join(__dirname, "../knexfile.js"))) {
    throw new Error("knexfile.js does not exist: initialise Knex by running `npx knex init`")
}

const knexConfig = require("../knexfile");
const knexEnv = process.env.NODE_ENV || "development";

const knex = require("knex")(knexConfig[knexEnv]);
module.exports = knex;