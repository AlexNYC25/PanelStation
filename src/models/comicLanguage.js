import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

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
      UNIQUE (name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_language table created successfully.");
    } else {
      logger.debug("comic_language table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_language table:", err);
  }
};

export const deleteComicLanguageTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_language;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_language table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_language table:", err);
  }
};
