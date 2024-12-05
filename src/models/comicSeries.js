import { runQuery } from "../config/dbConnection.js";

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
      console.log("comic_series table created successfully.");
    } else {
      console.log("comic_series table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_series table:", err);
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
    console.error("Error getting comic series:", err);
    throw err;
  }
};

export const insertComicSeriesIntoDb = async (seriesInfo) => {
  const query = `
    INSERT INTO comic_series (series_name, series_year)
    VALUES ($1, $2)
    ON CONFLICT (series_name, series_year) DO NOTHING
    RETURNING id;
  `;

  try {
    const result = await runQuery(query, [seriesInfo.seriesName, seriesInfo.seriesYear]);
    return { success: true, comicSeriesId: result[0]?.id };
  } catch (err) {
    console.error("Error inserting comic series:", err);
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
    console.error("Error getting comic series by id:", err);
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
    console.error("Error finding series id from series name:", err);
    throw err;
  }
};
