import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicSeriesGroupTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_series_group'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    UNIQUE (group_name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_series_group table created successfully.");
    } else {
      console.log("comic_series_group table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_series_group table:", err);
  }
};

export const deleteComicSeriesGroupTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_series_group;
  `;

  try {
    await runQuery(query);
    console.log("comic_series_group table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_series_group table:", err);
  }
};
