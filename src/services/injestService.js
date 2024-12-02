import {
  generateFolderHash,
  generateFileHash,
} from "../utilities/hashTools.js";
import { parseComicFolderName } from "../utilities/comicFolderParser.js";
import { readFilesRecursively } from "../utilities/comicBookDataDirectory.js";
import { insertComicFolder } from "../models/comicFolder.js";
import {
  insertComicSeries,
  findSeriesIdFromSeriesName,
} from "../models/comicSeries.js";
import { insertComicBook } from "../models/comicBook.js";
import { insertMappingIntoComicSeriesFolders } from "../models/comicSeriesFolders.js";

export const addFoldersToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const directories = readFilesRecursively(dataDir).directories;

  for (const dir of directories) {
    const folderHash = generateFolderHash(dir);

    let comicFolderId = null;
    let insertFolderResult = null;

    try {
      insertFolderResult = await insertComicFolder({
        folderPath: dir,
        folderHash,
      });
    } catch (err) {
      console.error("Error inserting folder:", err);
    }

    if (insertFolderResult.success) {
      comicFolderId = insertFolderResult.comicFolderId;
      console.log(
        `Inserted folder ${dir} into comic_folder table, with the id ${comicFolderId}`
      );
    }

    if (!comicFolderId) {
      continue;
    }

    const parsedComicDetails = parseComicFolderName(dir);
    let comicSeriesId = null;
    let insertSeriesResult = null;

    try {
      insertSeriesResult = await insertComicSeries({
        seriesName: parsedComicDetails.series_name,
        seriesYear: parsedComicDetails.series_year,
      });
    } catch (err) {
      console.error("Error inserting series:", err);
    }

    if (insertSeriesResult.success) {
      comicSeriesId = insertSeriesResult.comicSeriesId;
      console.log(
        `Inserted series ${parsedComicDetails.series_name} into comic_series table, with the id ${comicSeriesId}`
      );
    }

    if (!comicSeriesId) {
      continue;
    }

    let insertMappingResult = null;

    try {
      insertMappingResult = await insertMappingIntoComicSeriesFolders({
        seriesId: comicSeriesId,
        folderId: comicFolderId,
      });
    } catch (err) {
      console.error("Error inserting mapping:", err);
    }

    if (insertMappingResult.success) {
      console.log(
        `Inserted mapping for series_id ${comicSeriesId} and folder_id ${comicFolderId} into comic_series_folders table.`
      );
    }
  }
};

export const addFilesToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir).files;

  for (const filePath of filesList) {
    const fileName = path.basename(filePath);
    const fileHash = generateFileHash(filePath);
    const parentDir = path.dirname(filePath);

    let comicBookId = null;
    let insertComicBookResult = null;

    try {
      insertComicBookResult = await insertComicBook({
        fileName,
        filePath,
        fileHash,
      });
    } catch (err) {
      console.error("Error inserting comic book:", err);
    }

    if (insertComicBookResult.success) {
      comicBookId = insertComicBookResult.comicBookId;
      console.log(
        `Inserted file ${fileName} into comic_book table, with the id ${insertComicBookResult.comicBookId}`
      );
    }

    if (!comicBookId) {
      continue;
    }

    const parsedComicDetails = parseComicFolderName(parentDir);
    let seriesId = null;
    let findSeriesIdResult = null;

    try {
      findSeriesIdResult = await findSeriesIdFromSeriesName(
        parsedComicDetails.series_name
      );
    } catch (err) {
      console.error("Error finding series id:", err);
    }

    if (findSeriesIdResult.seriesId) {
      seriesId = findSeriesIdResult.seriesId;
      console.log(
        `Found series id ${seriesId} for series name ${parsedComicDetails.series_name}`
      );
    }

    if (!seriesId) {
      continue;
    }

    let insertMappingResult = null;

    try {
      insertMappingResult = await insertMappingIntoComicSeriesFolders({
        seriesId,
        comicBookId,
      });
    } catch (err) {
      console.error("Error inserting mapping:", err);
    }

    if (insertMappingResult.success) {
      console.log(
        `Inserted mapping for series_id ${seriesId} and comic_book_id ${comicBookId} into comic_series_folders table.`
      );
    }
  }
};
