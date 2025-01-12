import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicCharactersTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_characters'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_characters (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_characters table created successfully.");
    } else {
      console.log("comic_characters table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_characters table:", err);
  }
};

export const deleteComicCharactersTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_characters;
  `;

  try {
    await runQuery(query);
    console.log("comic_characters table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_characters table:", err);
  }
};