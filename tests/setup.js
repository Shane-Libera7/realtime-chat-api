process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });
const db = require('../src/db');



//Before Tests 
beforeAll(async () => {
    await db.raw('DROP SCHEMA public CASCADE');
    await db.raw('CREATE SCHEMA public');
    await db.migrate.latest();
    
    
});


//After Tests
afterAll( async () => {
    await db.migrate.rollback();
    await db.destroy();
});