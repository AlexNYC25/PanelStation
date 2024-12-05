import { runQuery } from "../config/dbConnection.js";

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
      console.log("comic_series_folders table created successfully.");
    } else {
      console.log("comic_series_folders table already exists.");
    }
  } catch (err) {
    console.error(
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
    console.log("comic_series_folders table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_series_folders table:", err);
  }
};

export const insertMappingIntoComicSeriesFolders = async (mappingInfo) => {
  const query = `
    INSERT INTO comic_series_folders (series_id, folder_id)
    VALUES ($1, $2)
    ON CONFLICT (series_id, folder_id) DO NOTHING;
  `;

  try {
    await runQuery(query, [mappingInfo.comicSeriesId, mappingInfo.folderId]);
    console.log(
      `Inserted mapping for series_id ${mappingInfo.comicSeriesId} and folder_id ${mappingInfo.folderId} into comic_series_folders table.`
    );

    return { success: true };
  } catch (err) {
    console.error(
      `Error inserting mapping for series_id ${mappingInfo.comicSeriesId} and folder_id ${mappingInfo.folderId} into comic_series_folders table:`,
      err
    );
    throw err;
  }
};
