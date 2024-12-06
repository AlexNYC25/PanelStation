import { runQuery } from "../config/dbConnection.js";

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
      console.log("comic_folder table created successfully.");
    } else {
      console.log("comic_folder table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_folder table:", err);
  }
};

export const deleteComicFolderTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_folder;
  `;
  try {
    await runQuery(query);
    console.log("comic_folder table deleted successfully.");
  }
  catch (err) {
    console.error("Error deleting comic_folder table:", err);
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
    console.error("Error getting comic folders:", err);
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
    console.error("Error inserting comic folder:", err);
    throw err;
  }
};
