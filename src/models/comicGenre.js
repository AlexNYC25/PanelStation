import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

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
      name VARCHAR(255) NOT NULL,
      genre_description TEXT
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_genre table created successfully.");
    } else {
      logger.debug("comic_genre table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_genre table:", err);
  }
};

export const deleteComicGenreTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_genre;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_genre table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_genre table:", err);
  }
};
