import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookSeriesMappingTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_series_mapping'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_series_mapping (
      id SERIAL PRIMARY KEY,
      comic_book_id INTEGER REFERENCES comic_book_file(id),
      comic_series_id INTEGER REFERENCES comic_series(id),
      UNIQUE (comic_book_id, comic_series_id)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_book_series_mapping table created successfully.");
    } else {
      logger.debug("comic_book_series_mapping table already exists.");
    }
  } catch (err) {
    logger.error(
      "Error checking or creating comic_book_series_mapping table:",
      err
    );
  }
};

export const deleteComicBookSeriesMappingTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_book_series_mapping;
  `;
  try {
    await runQuery(query);
    logger.debug("comic_book_series_mapping table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_book_series_mapping table:", err);
  }
};

export const insertComicBookSeriesMappingIntoDb = async (mappingInfo) => {
  const { comicBookId, seriesId } = mappingInfo;

  if (!comicBookId || !seriesId) {
    logger.error(
      "comicBookId and seriesId are required to insert into comic_book_series_mapping table."
    );
  }

  const query = `
      INSERT INTO comic_book_series_mapping (comic_book_id, comic_series_id)
      VALUES ($1, $2)
      ON CONFLICT (comic_book_id, comic_series_id) DO NOTHING;
  `;

  try {
    await runQuery(query, [comicBookId, seriesId]);
    logger.debug(
      `Inserted mapping for comic_book_id ${comicBookId} and comic_series_id ${seriesId} into comic_book_series_mapping table.`
    );
    return { success: true };
  } catch (err) {
    logger.error(
      `Error inserting mapping for comic_book_id ${comicBookId} and comic_series_id ${seriesId}:`,
      err
    );
    throw err;
  }
};

export const getComicBooksBySeriesIdFromDb = async (seriesId) => {
  const query = `
    SELECT 
      comic_book_series_mapping.comic_book_id,
      comic_book.file_name,
      comic_book.file_path
    FROM comic_book_series_mapping
    LEFT JOIN comic_book ON comic_book.id = comic_book_series_mapping.comic_book_id
    WHERE comic_series_id = $1;
  `;

  try {
    const result = await runQuery(query, [seriesId]);
    return result;
  } catch (err) {
    logger.error(`Error getting comic books for series id ${seriesId}:`, err);
    throw err;
  }
}