import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicCountryTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_country'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_country (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code CHAR(2) NOT NULL,
      UNIQUE (name, code)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_country table created successfully.");
    } else {
      logger.debug("comic_country table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_country table:", err);
  }
};

export const deleteComicCountryTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_country;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_country table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_country table:", err);
  }
};
