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
      summary TEXT,
      genre VARCHAR(255),
      page_count INTEGER
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

export const insertComicBookMetadataIntoDb = async (metadata) => {
  const insertQuery = `
    INSERT INTO comic_book_metadata (
      comic_book_id,
      series_name,
      title,
      issue_number,
      publisher,
      publication_date,
      summary,
      genre,
      page_count
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    ) RETURNING id;
  `;

  const values = [
    metadata.comic_book_id,
    metadata.series_name,
    metadata.title,
    metadata.issue_number,
    metadata.publisher,
    metadata.publication_date,
    metadata.summary,
    metadata.genre,
    metadata.page_count
  ];

  try {
    const result = await runQuery(insertQuery, values);
    return { success: true, id: result[0].id };
  } catch (err) {
    console.error("Error inserting comic book metadata:", err);
    return { success: false };
  }
}
