import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicFormatTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_format'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_format (
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
      logger.debug("comic_format table created successfully.");
    } else {
      logger.debug("comic_format table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_format table:", err);
  }
};

export const deleteComicFormatTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_format;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_format table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_format table:", err);
  }
};

export const insertComicFormatToDatabase = async (formatName) => {
  const insertQuery = `
    INSERT INTO comic_format (name)
    VALUES ($1)
    ON CONFLICT (name) DO NOTHING
    RETURNING id;
  `;

  const selectQuery = `
    SELECT id FROM comic_format
    WHERE name = $1;
  `;

  try {
    const insertResult = await runQuery(insertQuery, [formatName]);
    logger.debug(`Comic format ${formatName} added to database.`);

    if (insertResult.length > 0) {
      return insertResult[0].id;
    }

    const selectResult = await runQuery(selectQuery, [formatName]);
    return selectResult[0]?.id;
  } catch (err) {
    logger.error(`Error adding comic format ${formatName} to database:`, err);
  }
}