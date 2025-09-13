const knex = require('knex');
const config = require('../knexfile')[process.env.ENVIRONMENT || "development"];

const db = knex(config);
module.exports = db;