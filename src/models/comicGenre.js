import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicGenreTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_genre'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_genre (
      id SERIAL PRIMARY KEY,
      genre_name VARCHAR(255) NOT NULL,
      genre_description TEXT
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_genre table created successfully.");
    } else {
      console.log("comic_genre table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_genre table:", err);
  }
};

export const deleteComicGenreTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_genre;
  `;

  try {
    await runQuery(query);
    console.log("comic_genre table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_genre table:", err);
  }
};
