import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicLocationsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_locations'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_locations (
      id SERIAL PRIMARY KEY,
      location_name VARCHAR(255) NOT NULL,
      location_description TEXT
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_locations table created successfully.");
    } else {
      console.log("comic_locations table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_locations table:", err);
  }
};

export const deleteComicLocationsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_locations;
  `;

  try {
    await runQuery(query);
    console.log("comic_locations table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_locations table:", err);
  }
};