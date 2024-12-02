import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST, // Update this if your PostgreSQL server is hosted elsewhere
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

export const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to the PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("Error connecting to the PostgreSQL database", err);
  }
};

export const runQuery = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Error running query", err);
    throw err;
  }
};
