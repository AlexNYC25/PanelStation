import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.DB_HOST, // Update this if your PostgreSQL server is hosted elsewhere
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

/*
  * Connect to the PostgreSQL database
  * @returns {Promise<void>} A promise that resolves if the connection is successful, otherwise rejects with an error
*/
export const connectToDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to the PostgreSQL database");
    client.release();
  } catch (err) {
    console.error("Error connecting to the PostgreSQL database", err);
  }
};

/*
  * Run a query against the PostgreSQL database
  * @param {string} query - The SQL query to run
  * @param {Array} params - An array of parameters to pass to the query
  * @returns {Promise<Array>} A promise that resolves with the query results, otherwise rejects with an error
*/
export const runQuery = async (query, params) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error("Error running query", err);
    throw err;
  }
};
