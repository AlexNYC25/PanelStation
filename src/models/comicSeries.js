import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicSeriesTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_series'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series (
      id SERIAL PRIMARY KEY,
      series_name VARCHAR(255) NOT NULL,
      series_year INTEGER,
      UNIQUE (series_name, series_year)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_series table created successfully.");
    } else {
      logger.debug("comic_series table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_series table:", err);
  }
};

export const deleteComicSeriesTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_series;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_series table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_series table:", err);
  }
};

export const getAllComicSeriesFromDb = async () => {
  const query = `
        SELECT * FROM comic_series;
    `;

  try {
    const comicSeries = await runQuery(query);
    return comicSeries;
  } catch (err) {
    logger.error("Error getting comic series:", err);
    throw err;
  }
};

export const insertComicSeriesIntoDb = async (seriesInfo) => {
  if (typeof seriesInfo.seriesName !== "string") {
    logger.error(
      `Error inserting comic series into comic_series table: Series name is not a string. ${seriesInfo.seriesName} + ${typeof seriesInfo.seriesName}`
    );
    return { success: false };
  }

  if (!Number.isInteger(seriesInfo.seriesYear)) {
    logger.error(
      `Error inserting comic series into comic_series table: Series year is not an integer. ${seriesInfo.seriesYear} + ${typeof seriesInfo.seriesYear}`
    );
    return { success: false };
  }

  const insertQuery = `
    INSERT INTO comic_series (series_name, series_year)
    VALUES ($1, $2)
    ON CONFLICT (series_name, series_year) DO NOTHING
    RETURNING id;
  `;

  const selectQuery = `
    SELECT id FROM comic_series
    WHERE series_name = $1 AND series_year = $2;
  `;

  try {
    const insertResult = await runQuery(insertQuery, [
      seriesInfo.seriesName,
      seriesInfo.seriesYear,
    ]);

    if (insertResult.length > 0) {
      // Insert successful, return the new ID
      return { success: true, comicSeriesId: insertResult[0].id };
    }

    // If insert did nothing (conflict), query for the existing ID
    const selectResult = await runQuery(selectQuery, [
      seriesInfo.seriesName,
      seriesInfo.seriesYear,
    ]);

    if (selectResult.length > 0) {
      return { success: true, comicSeriesId: selectResult[0].id };
    }

    // If no ID is found, return failure
    return { success: false };
  } catch (err) {
    logger.error("Error inserting or selecting comic series:", err);
    throw err;
  }
};


export const getComicSeriesByIdFromDb = async (seriesId) => {
  const query = `
    SELECT * FROM comic_series
    WHERE id = $1;
  `;

  try {
    const result = await runQuery(query, [seriesId]);
    return result[0];
  } catch (err) {
    logger.error("Error getting comic series by id:", err);
    throw err;
  }
}

export const findSeriesIdFromSeriesNameInDb = async (seriesName) => {
  const query = `
    SELECT id FROM comic_series
    WHERE series_name = $1;
  `;

  try {
    const result = await runQuery(query, [seriesName]);
    return { seriesId: result[0]?.id, seriesName };
  } catch (err) {
    logger.error("Error finding series id from series name:", err);
    throw err;
  }
};

export const findSeriesIdFromSeriesNameAndYearInDb = async (seriesName, seriesYear) => {
  const query = `
    SELECT id FROM comic_series
    WHERE series_name = $1
    AND series_year = $2;
  `;

  try {
    const result = await runQuery(query, [seriesName, seriesYear]);
    return { seriesId: result[0]?.id, seriesName, seriesYear };
  } catch (err) {
    logger.error("Error finding series id from series name and year:", err);
    throw err;
  }
}