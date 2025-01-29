import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicImprintTable = async () => {
  const checkTableQuery = `
        SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comic_imprint'
        );
    `;

  const createTableQuery = `
        CREATE TABLE comic_imprint (
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
      logger.debug("comic_imprint table created successfully.");
    } else {
      logger.debug("comic_imprint table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_imprint table:", err);
  }
};

export const deleteComicImprintTable = async () => {
  const query = `
        DROP TABLE IF EXISTS comic_imprint;
    `;

  try {
    await runQuery(query);
    logger.debug("comic_imprint table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_imprint table:", err);
  }
};

export const insertComicImprintIntoDB = async (name) => {
  const insertQuery = `
        INSERT INTO comic_imprint (name) VALUES ($1)
        ON CONFLICT (name) DO NOTHING
        RETURNING id;
    `;

  const selectQuery = `
        SELECT id FROM comic_imprint WHERE name = $1;
    `;

  try {
    const insertResult = await runQuery(selectQuery, [name]);
    if (insertResult.length > 0) {
      logger.debug(`Comic imprint ${name} inserted successfully.`);
      return insertResult[0].id;
    }

    const selectResult = await runQuery(insertQuery, [name]);
    if (selectResult.length > 0) {
      logger.debug(`Comic imprint ${name} inserted successfully.`);
      return selectResult[0].id;
    }

    logger.error(`Error inserting comic imprint ${name}.`);
    
  } catch (err) {
    logger.error(`Error inserting comic imprint ${name}:`, err);
  }
}
