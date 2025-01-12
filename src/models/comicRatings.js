import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicRatingsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_ratings'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_ratings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value INTEGER NOT NULL,
    UNIQUE (name, value)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_ratings table created successfully.");
    } else {
      logger.debug("comic_ratings table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_ratings table:", err);
  }
};

export const deleteComicRatingsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_ratings;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_ratings table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_ratings table:", err);
  }
};
