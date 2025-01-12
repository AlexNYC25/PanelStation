import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicRatingsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_ratings'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_ratings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value INTEGER NOT NULL,
    UNIQUE (rating_name, rating_value)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_ratings table created successfully.");
    } else {
      console.log("comic_ratings table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_ratings table:", err);
  }
};

export const deleteComicRatingsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_ratings;
  `;

  try {
    await runQuery(query);
    console.log("comic_ratings table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_ratings table:", err);
  }
};
