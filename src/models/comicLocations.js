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
      UNIQUE (name)
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

export const insertComicLocationIntoDb = async (location) => {
  const insertQuery = `
    INSERT INTO comic_locations (name)
    VALUES ($1)
    ON CONFLICT (name) DO NOTHING
    RETURNING id;
  `;

  const selectQuery = `
    SELECT name FROM comic_locations WHERE name = $1;
  `;

  try {
    const result = await runQuery(selectQuery, [location]);
    if (result.length === 0) {
      let insertResult = await runQuery(insertQuery, [location]);
      logger.debug(`Inserted location ${location} into comic_locations.`);
      return insertResult[0].id;
    } else {
      logger.debug(`Location ${location} already exists in comic_locations.`);
      return result[0].id;
    }
  } catch (err) {
    logger.error(`Error inserting location ${location} into comic_locations:`, err);
  }
};