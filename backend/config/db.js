const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

const query = (text, params) => pool.query(text, params);

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
  } else {
    console.log('Successfully connected to PostgreSQL');
  }
});

module.exports = {
  pool,
  query,
};

