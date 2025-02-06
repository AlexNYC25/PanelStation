import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicSeriesGroupTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_series_group'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series_group (
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
      logger.debug("comic_series_group table created successfully.");
    } else {
      logger.debug("comic_series_group table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_series_group table:", err);
  }
};

export const deleteComicSeriesGroupTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_series_group;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_series_group table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_series_group table:", err);
  }
};

export const insertComicSeriesGroup = async (name) => {
  const insertQuery = `
    INSERT INTO comic_series_group (name)
    VALUES ($1)
    RETURNING id;
  `;

  const selectQuery = `
    SELECT id
    FROM comic_series_group
    WHERE name = $1;
  `;

  try {
    const result = await runQuery(selectQuery, [name]);

    if (result.length > 0) {
      return result[0].id;
    }

    const insertResult = await runQuery(insertQuery, [name]);
    return insertResult[0].id;
  } catch (err) {
    logger.error("Error inserting comic_series_group:", err);
  }
};
