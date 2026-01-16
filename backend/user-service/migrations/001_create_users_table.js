// user-service/migrations/001_create_users_table.js
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    auth_id: { type: 'integer', notNull: true, unique: true },
    name: { type: 'varchar(120)' },
    email: { type: 'varchar(120)', unique: true },
    phone: { type: 'varchar(20)' },
    gender: { type: 'varchar(10)' },
    dob: 'date',
    profile_pic_url: 'varchar(255)',
    address: { type: 'jsonb' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    deleted_at: { type: 'timestamp', default: null }
  });
};


