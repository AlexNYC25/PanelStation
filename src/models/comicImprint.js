import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicImprintTable = async () => {
  const checkTableQuery = `
        SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comic_imprint'
        );
    `;

  const createTableQuery = `
        CREATE TABLE comic_imprint (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        UNIQUE (imprint_name)
        );
    `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_imprint table created successfully.");
    } else {
      console.log("comic_imprint table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_imprint table:", err);
  }
};

export const deleteComicImprintTable = async () => {
  const query = `
        DROP TABLE IF EXISTS comic_imprint;
    `;

  try {
    await runQuery(query);
    console.log("comic_imprint table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_imprint table:", err);
  }
};
