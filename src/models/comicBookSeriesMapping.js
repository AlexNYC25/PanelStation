import { runQuery } from "../config/dbConnection.js";

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
      comic_book_id INTEGER REFERENCES comic_book(id),
      comic_series_id INTEGER REFERENCES comic_series(id),
      UNIQUE (comic_book_id, comic_series_id)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_book_series_mapping table created successfully.");
    } else {
      console.log("comic_book_series_mapping table already exists.");
    }
  } catch (err) {
    console.error(
      "Error checking or creating comic_book_series_mapping table:",
      err
    );
  }
};

export const insertComicBookSeriesMapping = async (comicBookId, seriesId) => {
  const query = `
      INSERT INTO comic_book_series_mapping (comic_book_id, comic_series_id)
      VALUES ($1, $2)
      ON CONFLICT (comic_book_id, comic_series_id) DO NOTHING;
  `;

  try {
    await runQuery(query, [comicBookId, seriesId]);
    console.log(
      `Inserted mapping for comic_book_id ${comicBookId} and comic_series_id ${seriesId} into comic_book_series_mapping table.`
    );
    return { success: true };
  } catch (err) {
    console.error(
      `Error inserting mapping for comic_book_id ${comicBookId} and comic_series_id ${seriesId}:`,
      err
    );
    throw err;
  }
};
