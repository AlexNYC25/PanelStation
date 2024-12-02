import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicBookRolesTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_roles'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_roles (
      id SERIAL PRIMARY KEY,
      writer VARCHAR(255),
      cover_artist VARCHAR(255),
      editor VARCHAR(255)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_book_roles table created successfully.");
    } else {
      console.log("comic_book_roles table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_book_roles table:", err);
  }
};
