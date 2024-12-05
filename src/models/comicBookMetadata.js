import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicBookMetadataTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_metadata'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_metadata (
      id SERIAL PRIMARY KEY,
      comic_book_id INTEGER REFERENCES comic_book(id),
      series_name VARCHAR(255),
      title VARCHAR(255),
      issue_number VARCHAR(50),
      publisher VARCHAR(255),
      publication_date DATE,
      synopsis TEXT,
      genre VARCHAR(255),
      page_count INTEGER,
      language VARCHAR(50)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_book_metadata table created successfully.");
    } else {
      console.log("comic_book_metadata table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_book_metadata table:", err);
  }
};

export const deleteComicBookMetadataTable = async () => {
  const deleteTableQuery = `
    DROP TABLE IF EXISTS comic_book_metadata;
  `;

  try {
    await runQuery(deleteTableQuery);
    console.log("comic_book_metadata table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_book_metadata table:", err);
  }
};
