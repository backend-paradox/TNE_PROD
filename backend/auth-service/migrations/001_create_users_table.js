exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: { type: 'varchar(120)', notNull: true },
    email: { type: 'varchar(120)', notNull: true, unique: true },
    password: { type: 'text', notNull: true },
    phone: { type: 'varchar(20)' },
    is_verified: { type: 'boolean', default: false },
    last_login: { type: 'timestamp' },
    failed_attempts: { type: 'integer', default: 0 },
    locked_until: { type: 'timestamp' },
    reset_token: { type: 'text' },
    reset_token_expires: { type: 'timestamp' },
    verification_token: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};
