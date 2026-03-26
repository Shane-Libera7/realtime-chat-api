require('dotenv').config({ 
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' 
});
const knex = require('knex');
const config = require('../knexfile');


console.log(process.env.DB_HOST);
// Initialise DB 
const env = process.env.NODE_ENV || 'development';
const db = knex(config[env]);


//Export DB

module.exports = db;