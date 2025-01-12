import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicLocationsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_locations'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_locations (
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
      logger.debug("comic_locations table created successfully.");
    } else {
      logger.debug("comic_locations table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_locations table:", err);
  }
};

export const deleteComicLocationsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_locations;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_locations table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_locations table:", err);
  }
};