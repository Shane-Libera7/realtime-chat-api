/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('direct_messages', function(table) {
        table.increments('id')
        table.integer('sender_id').notNullable()
        table.foreign('sender_id').references('users.id');
        table.integer('recipient_id').notNullable()
        table.foreign('recipient_id').references('users.id')
        table.timestamps(true, true)

    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
