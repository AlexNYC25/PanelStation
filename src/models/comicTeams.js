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
      UNIQUE (name)
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

export const insertComicTeamIntoDb = async (name) => {
  const selectQuery = `
    SELECT id FROM comic_teams WHERE name = $1;
  `;

  const insertQuery = `
    INSERT INTO comic_teams (name) VALUES ($1) RETURNING id;
  `;

  try {
    const result = await runQuery(selectQuery, [name]);

    if (result.length > 0) {
      return result[0].id;
    }

    const insertResult = await runQuery(insertQuery, [name]);
    return insertResult[0].id;
  } catch (err) {
    logger.error("Error inserting comic team into db:", err);
  }
};