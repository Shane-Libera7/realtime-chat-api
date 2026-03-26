/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('messages', function(table) {
        table.increments('id')
        table.integer('room_id').unsigned().notNullable()
        table.foreign('room_id').references('rooms.id')
        table.integer('user_id').unsigned().notNullable()
        table.foreign('user_id').references('users.id')
        table.timestamps(true, true)
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
