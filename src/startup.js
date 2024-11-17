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

const checkAndCreateComicSeriesTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_series'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series (
      id SERIAL PRIMARY KEY,
      series_name VARCHAR(255) NOT NULL,
      series_year INTEGER,
      UNIQUE (series_name, series_year)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_series table created successfully.");
    } else {
      console.log("comic_series table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_series table:", err);
  }
};

const checkAndCreateComicSeriesFoldersTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_series_folders'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_series_folders (
      id SERIAL PRIMARY KEY,
      series_id INTEGER REFERENCES comic_series(id),
      folder_id INTEGER REFERENCES comic_folder(id),
      UNIQUE (series_id, folder_id)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_series_folders table created successfully.");
    } else {
      console.log("comic_series_folders table already exists.");
    }
  } catch (err) {
    console.error(
      "Error checking or creating comic_series_folders table:",
      err
    );
  }
};

const checkAndCreateComicBookRolesTable = async () => {
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

const checkAndCreateComicBookMetadataTable = async () => {
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
      comic_series_id INTEGER REFERENCES comic_series(id),
      roles_id INTEGER REFERENCES comic_book_roles(id),
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

export {
  checkComicBookDataDirectoryExists,
  checkAndCreateComicBookTable,
  checkAndCreateComicFolderTable,
  checkAndCreateComicSeriesTable,
  checkAndCreateComicSeriesFoldersTable,
  checkAndCreateComicBookRolesTable,
  checkAndCreateComicBookMetadataTable,
};
