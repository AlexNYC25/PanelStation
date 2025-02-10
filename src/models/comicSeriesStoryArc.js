import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicSeriesStoryArcTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_series_story_arc'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series_story_arc (
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
      logger.debug("comic_series_story_arc table created successfully.");
    } else {
      logger.debug("comic_series_story_arc table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_series_story_arc table:", err);
  }
};

export const deleteComicSeriesStoryArcTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_series_story_arc;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_series_story_arc table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_series_story_arc table:", err);
  }
};

export const insertComicSeriesStoryArc = async (name) => {
  const selectQuery = `
    SELECT * FROM comic_series_story_arc
    WHERE name = $1;
  `;

  const insertQuery = `
    INSERT INTO comic_series_story_arc (name)
    VALUES ($1)
    RETURNING *;
  `;

  try {
    const selectResult = await runQuery(selectQuery, [name]);

    if (selectResult.length > 0) {
      return selectResult[0]?.id;
    }

    const insertResult = await runQuery(insertQuery, [name]);
    return insertResult[0]?.id;
  } catch (err) {
    logger.error("Error inserting comic series story arc:", err);
  }
};