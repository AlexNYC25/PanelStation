import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicGenreTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_genre'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_genre (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      UNIQUE(name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_genre table created successfully.");
    } else {
      logger.debug("comic_genre table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_genre table:", err);
  }
};

export const deleteComicGenreTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_genre;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_genre table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_genre table:", err);
  }
};

export const insertComicGenreIntoDb = async (name) => {
  const insertQuery = `
    INSERT INTO comic_genre (name)
    VALUES ($1)
    RETURNING id;
  `;

  const selectQuery = `
    SELECT id FROM comic_genre WHERE name = $1;
  `;

  try {
    const selectResult = await runQuery(selectQuery, [name]);

    if (selectResult.length > 0) {
      logger.debug(`Genre ${name} already exists in comic_genre table.`);
      return selectResult[0].id;
    }

    const insertResult = await runQuery(insertQuery, [name]);
    
    if (insertResult.length > 0) {
      logger.debug(`Inserted genre ${name} into comic_genre table.`);
      return insertResult[0].id;
    }

  } catch (err) {
    logger.error(`Error inserting genre ${name} into comic_genre table:`, err);
  }
}