/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('rooms', function(table) {
        table.increments('id')
        table.string('name').notNullable()
        table.integer('owner_id').unsigned().notNullable()
        table.foreign('owner_id').references('users.id')
        table.timestamps(true, true)
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
