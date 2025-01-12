import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicTeamsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_teams'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_teams (
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
      logger.debug("comic_teams table created successfully.");
    } else {
      logger.debug("comic_teams table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_teams table:", err);
  }
};

export const deleteComicTeamsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_teams;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_teams table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_teams table:", err);
  }
};