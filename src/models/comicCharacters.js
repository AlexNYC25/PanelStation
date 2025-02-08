import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicCharactersTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_characters'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_characters (
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
      logger.debug("comic_characters table created successfully.");
    } else {
      logger.debug("comic_characters table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_characters table:", err);
  }
};

export const deleteComicCharactersTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_characters;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_characters table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_characters table:", err);
  }
};

export const insertComicCharacterIntoDb = async (name) => {
  const selectQuery = `
    SELECT id FROM comic_characters WHERE name = $1;
  `;

  const insertQuery = `
    INSERT INTO comic_characters (name) VALUES ($1) RETURNING id;
  `;

  try {
    const result = await runQuery(selectQuery, [name]);

    if (result.length === 0) {
      const insertResult = await runQuery(insertQuery, [name]);
      logger.debug(`Comic character ${name} inserted successfully.`);
      return insertResult[0].id;
    } else {
      logger.debug(`Comic character ${name} already exists.`);
      return result[0].id;
    }
  } catch (err) {
    logger.error(`Error inserting comic character ${name} into db:`, err);
  }
};