import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicTeamsTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_teams'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_teams table created successfully.");
    } else {
      console.log("comic_teams table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_teams table:", err);
  }
};

export const deleteComicTeamsTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_teams;
  `;

  try {
    await runQuery(query);
    console.log("comic_teams table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_teams table:", err);
  }
};