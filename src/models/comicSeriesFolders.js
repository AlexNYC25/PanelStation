import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicSeriesFoldersTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_series_folders'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series_folders (
      id SERIAL PRIMARY KEY,
      series_id INTEGER REFERENCES comic_series(id),
      folder_id INTEGER REFERENCES comic_folder(id),
      UNIQUE (series_id, folder_id)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_series_folders table created successfully.");
    } else {
      logger.debug("comic_series_folders table already exists.");
    }
  } catch (err) {
    logger.error(
      "Error checking or creating comic_series_folders table:",
      err
    );
  }
};

export const deleteComicSeriesFoldersTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_series_folders;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_series_folders table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_series_folders table:", err);
  }
};

export const insertMappingIntoComicSeriesFolders = async (mappingInfo) => {

  // Check if the values are valid integers
  if (
    !Number.isInteger(mappingInfo.seriesId) ||
    !Number.isInteger(mappingInfo.folderId)
  ) {
    logger.error(
      `Error inserting mapping for series_id ${mappingInfo.seriesId} and folder_id ${mappingInfo.folderId} into comic_series_folders table:`,
      "series_id and folder_id must be integers."
    );
    return { success: false };
  }

  const query = `
    INSERT INTO comic_series_folders (series_id, folder_id)
    VALUES ($1, $2)
    ON CONFLICT (series_id, folder_id) DO NOTHING
    RETURNING id;
  `;

  try {

    const result = await runQuery(query, [mappingInfo.seriesId, mappingInfo.folderId]);

    logger.debug(
      `Inserted mapping for series_id ${mappingInfo.seriesId} and folder_id ${mappingInfo.folderId} into comic_series_folders table.`
    );

    return { success: true, mappingId: result[0]?.id };
  } catch (err) {
    logger.error(
      `Error inserting mapping for series_id ${mappingInfo.seriesId} and folder_id ${mappingInfo.folderId} into comic_series_folders table:`,
      err
    );
    throw err;
  }
};

export const findMappingInComicSeriesFolders = async (mappingInfo) => {
  const query = `
    SELECT * FROM comic_series_folders
    WHERE series_id = $1 AND folder_id = $2;
  `;

  try {
    const result = await runQuery(query, [
      mappingInfo.comicSeriesId,
      mappingInfo.folderId,
    ]);

    return result;
  } catch (err) {
    logger.error(
      `Error finding mapping for series_id ${mappingInfo.comicSeriesId} and folder_id ${mappingInfo.folderId} in comic_series_folders table:`,
      err
    );
    throw err;
  }
};
