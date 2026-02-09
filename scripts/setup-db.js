const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in .env.local');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_approved BOOLEAN DEFAULT FALSE
      );
    `);
        console.log("Table 'users' created successfully.");

        // Create an initial admin user if not exists (optional, for convenience)
        // You might want to skip this or make it interactive in a real app

    } catch (err) {
        console.error("Error creating table:", err);
    } finally {
        client.release();
        pool.end();
    }
}

main();
