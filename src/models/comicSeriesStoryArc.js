import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicSeriesStoryArcTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_series_story_arc'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series_story_arc (
      id SERIAL PRIMARY KEY,
      story_arc_name VARCHAR(255) NOT NULL,
      UNIQUE (story_arc_name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_series_story_arc table created successfully.");
    } else {
      console.log("comic_series_story_arc table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_series_story_arc table:", err);
  }
};

export const deleteComicSeriesStoryArcTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_series_story_arc;
  `;

  try {
    await runQuery(query);
    console.log("comic_series_story_arc table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_series_story_arc table:", err);
  }
};
