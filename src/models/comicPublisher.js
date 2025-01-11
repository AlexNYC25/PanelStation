import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicPublisherTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_publisher'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_publisher (
    id SERIAL PRIMARY KEY,
    publisher_name VARCHAR(255) NOT NULL,
    UNIQUE (publisher_name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_publisher table created successfully.");
    } else {
      console.log("comic_publisher table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_publisher table:", err);
  }
};

export const deleteComicPublisherTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_publisher;
  `;

  try {
    await runQuery(query);
    console.log("comic_publisher table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_publisher table:", err);
  }
};
