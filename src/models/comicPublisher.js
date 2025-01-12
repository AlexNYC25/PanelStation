import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

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
    name VARCHAR(255) NOT NULL,
    UNIQUE (name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_publisher table created successfully.");
    } else {
      logger.debug("comic_publisher table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_publisher table:", err);
  }
};

export const deleteComicPublisherTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_publisher;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_publisher table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_publisher table:", err);
  }
};
