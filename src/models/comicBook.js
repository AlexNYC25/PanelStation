import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_file'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_file (
      id SERIAL PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL UNIQUE,
      file_hash TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_book_file table created successfully.");
    } else {
      logger.debug("comic_book_file table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_book table:", err);
  }
};

export const deleteComicBookTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_book_file;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_book_file table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_book table:", err);
  }
};

export const getComicBooksInDb = async () => {
  const query = `
    SELECT
      id,
      file_name,
      file_path 
    FROM comic_book_file;
  `;

  try {
    const comicBooks = await runQuery(query);
    return comicBooks;
  } catch (err) {
    logger.error("Error getting comic books:", err);
    throw err;
  }
};

export const getComicBookById = async (id) => {
  const query = `
    SELECT
      id,
      file_name,
      file_path 
    FROM comic_book_file
    WHERE id = $1;
  `;

  try {
    const comicBook = await runQuery(query, [id]);
    return comicBook;
  } catch (err) {
    logger.error("Error getting comic book by id:", err);
    throw err;
  }
};

export const getComicBookByHash = async (hash) => {
  const query = `
    SELECT
      id,
      file_name,
      file_path 
    FROM comic_book_file
    WHERE file_hash = $1;
  `;

  try {
    const comicBook = await runQuery(query, [hash]);
    return comicBook;
  } catch (err) {
    logger.error("Error getting comic book by hash:", err);
    throw err;
  }
};

export const getComicBookPathFromDb = async (id) => {
  const query = `
		SELECT file_path FROM comic_book_file WHERE id = $1;
	`;

  try {
    const comicBook = await runQuery(query, [id]);
    return comicBook;
  } catch (err) {
    logger.error("Error getting comic book path:", err);
    throw err;
  }
};

export const insertComicBookIntoDb = async (bookInfo) => {

  // check the bookInfo object to see if it has the required properties
  if (!bookInfo.fileName || !bookInfo.filePath || !bookInfo.fileHash) {
    throw new Error("Missing required properties in bookInfo object.");
  }

  const query = `
    INSERT INTO comic_book_file (file_name, file_path, file_hash)
    VALUES ($1, $2, $3)
    ON CONFLICT (file_path) DO NOTHING
    RETURNING id;
  `;

  try {
    const result = await runQuery(query, [
      bookInfo.fileName,
      bookInfo.filePath,
      bookInfo.fileHash,
    ]);
    return { success: true, comicBookId: result[0]?.id };
    
  } catch (err) {
    logger.error("Error inserting comic book by running the insert query:", err);
    throw err;
  }
};

