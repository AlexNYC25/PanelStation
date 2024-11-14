import fs from "fs";

import { runQuery } from "./config/dbConnection.js";

let checkComicBookDataDirectoryExists = () => {
  const dataDir = process.env.DATA_DIR;
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir);
      console.log(`Directory ${dataDir} created successfully.`);
    } catch (err) {
      console.error(`Error creating directory ${dataDir}:`, err);
    }
  } else {
    console.log(`Directory ${dataDir} already exists.`);
  }
};

const checkAndCreateComicBookTable = async () => {
  const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'comic_book'
      );
    `;

  const createTableQuery = `
      CREATE TABLE comic_book (
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
      console.log("comic_book table created successfully.");
    } else {
      console.log("comic_book table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_book table:", err);
  }
};

const checkAndCreateComicFolderTable = async () => {
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

export {
  checkComicBookDataDirectoryExists,
  checkAndCreateComicBookTable,
  checkAndCreateComicFolderTable,
};
