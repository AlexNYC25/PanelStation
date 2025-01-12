import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicFolderTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_folder'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_folder (
      id SERIAL PRIMARY KEY,
      folder_path TEXT NOT NULL UNIQUE,
      folder_hash TEXT NOT NULL UNIQUE
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_folder table created successfully.");
    } else {
      logger.debug("comic_folder table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_folder table:", err);
  }
};

export const deleteComicFolderTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_folder;
  `;
  try {
    await runQuery(query);
    logger.debug("comic_folder table deleted successfully.");
  }
  catch (err) {
    logger.error("Error deleting comic_folder table:", err);
  }
};

export const getComicFolders = async () => {
  const query = `
		SELECT * FROM comic_folder;
	`;

  try {
    const comicFolders = await runQuery(query);
    return comicFolders;
  } catch (err) {
    logger.error("Error getting comic folders:", err);
    throw err;
  }
};

export const insertComicFolderIntoDb = async (folderInfo) => {
  const query = `
    INSERT INTO comic_folder (folder_path, folder_hash)
    VALUES ($1, $2)
    ON CONFLICT (folder_path) DO NOTHING
    RETURNING id;
  `;

  try {
    const result = await runQuery(query, [
      folderInfo.folderPath,
      folderInfo.folderHash,
    ]);
    return { success: true, comicFolderId: result[0]?.id };
  } catch (err) {
    logger.error("Error inserting comic folder:", err);
    throw err;
  }
};

export const getComicFolderUsingHash = async (folderHash) => {
  const query = `
    SELECT * FROM comic_folder
    WHERE folder_hash = $1;
  `;

  try {
    const comicFolder = await runQuery(query, [folderHash]);
    return comicFolder[0];
  } catch (err) {
    logger.error("Error getting comic folder using hash:", err);
    throw err;
  }
}
