import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicLanguageTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_language'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_language (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      UNIQUE (language_name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_language table created successfully.");
    } else {
      console.log("comic_language table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_language table:", err);
  }
};

export const deleteComicLanguageTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_language;
  `;

  try {
    await runQuery(query);
    console.log("comic_language table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_language table:", err);
  }
};
