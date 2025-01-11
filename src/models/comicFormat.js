import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicFormatTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_format'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_format (
      id SERIAL PRIMARY KEY,
      format_name VARCHAR(255) NOT NULL,
      UNIQUE (format_name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_format table created successfully.");
    } else {
      console.log("comic_format table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_format table:", err);
  }
};

export const deleteComicFormatTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_format;
  `;

  try {
    await runQuery(query);
    console.log("comic_format table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_format table:", err);
  }
};