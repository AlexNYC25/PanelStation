import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicCountryTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_country'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_country (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code CHAR(2) NOT NULL,
      UNIQUE (country_name, country_code)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_country table created successfully.");
    } else {
      console.log("comic_country table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_country table:", err);
  }
};

export const deleteComicCountryTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_country;
  `;

  try {
    await runQuery(query);
    console.log("comic_country table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_country table:", err);
  }
};
