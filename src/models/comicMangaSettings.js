import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicMangaSettingsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_manga_settings'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_manga_settings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    UNIQUE (name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_manga_settings table created successfully.");
    } else {
      logger.debug("comic_manga_settings table already exists.");
    }
  } catch (err) {
    logger.error(
      "Error checking or creating comic_manga_settings table:",
      err
    );
  }
};

export const deleteComicMangaSettingsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_manga_settings;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_manga_settings table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_manga_settings table:", err);
  }
};