import fs from "fs";

import { runQuery } from "./config/dbConnection.js";
import { checkAndCreateComicBookTable } from "./models/comicBook.js";
import { checkAndCreateComicFolderTable } from "./models/comicFolder.js";
import { checkAndCreateComicSeriesTable } from "./models/comicSeries.js";
import { checkAndCreateComicSeriesFoldersTable } from "./models/comicSeriesFolders.js";
import { checkAndCreateComicBookRolesTable } from "./models/comicBookRoles.js";
import { checkAndCreateComicBookMetadataTable } from "./models/comicBookMetadata.js";
import { checkAndCreateComicBookMetadataRolesTable } from "./models/comicBookMetadataRoles.js";
import { checkAndCreateComicBookSeriesMappingTable } from "./models/comicBookSeriesMapping.js";

const checkComicBookDataDirectoryExists = () => {
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

const initializeDatabase = async () => {
  await checkAndCreateComicBookTable()
  await checkAndCreateComicFolderTable()
  await checkAndCreateComicSeriesTable()
  await checkAndCreateComicSeriesFoldersTable()
  await checkAndCreateComicBookRolesTable()
  await checkAndCreateComicBookMetadataTable()
  await checkAndCreateComicBookMetadataRolesTable()
  await checkAndCreateComicBookSeriesMappingTable()
}


export {
  checkComicBookDataDirectoryExists,
  initializeDatabase
};
