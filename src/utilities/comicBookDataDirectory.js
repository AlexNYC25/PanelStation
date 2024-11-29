import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";

import { runQuery } from "../config/dbConnection.js";
import { parseComicFolderName } from "./comicFolderParser.js";
import { parseComicFileName, hasComicInfoXml } from "./comicFileParser.js";

const allowedExtensions = [".cbz", ".cbr", ".zip", ".rar"];

const readFilesRecursively = (dir) => {
  let results = { files: [], directories: new Set() };

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recursively read files in the directory
      const subDirResults = readFilesRecursively(filePath);
      results.files = results.files.concat(subDirResults.files);
      subDirResults.directories.forEach((d) => results.directories.add(d));
    } else {
      // Add file to results if it has an allowed extension
      if (allowedExtensions.includes(path.extname(file).toLowerCase())) {
        results.files.push(filePath);
        results.directories.add(dir);
      }
    }
  });

  return results;
};

const listFiles = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir).files;
  return JSON.stringify(filesList, null, 2);
};

const listFoldersWithAllowedFiles = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const directories = Array.from(readFilesRecursively(dataDir).directories);
  return JSON.stringify(directories, null, 2);
};

const generateFileHash = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(fileBuffer);
  return hashSum.digest("hex");
};

const generateFolderHash = (folderPath) => {
  const hashSum = crypto.createHash("sha256");
  hashSum.update(folderPath);
  return hashSum.digest("hex");
};

const addFilesToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir).files;

  for (const filePath of filesList) {
    const fileName = path.basename(filePath);
    const fileHash = generateFileHash(filePath);
    const parentDir = path.dirname(filePath);
    const insertComicBookQuery = `
      INSERT INTO comic_book (file_name, file_path, file_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (file_path) DO NOTHING
      RETURNING id;
    `;

    try {
      const comicBookResult = await runQuery(insertComicBookQuery, [
        fileName,
        filePath,
        fileHash,
      ]);
      const comicBookId = comicBookResult[0]?.id;

      if (comicBookId) {
        const selectSeriesQuery = `
          SELECT id FROM comic_series
          WHERE series_name = $1;
        `;
        const parsedComicDetails = parseComicFolderName(parentDir);
        const seriesResult = await runQuery(selectSeriesQuery, [
          parsedComicDetails.series_name,
        ]);
        const seriesId = seriesResult[0]?.id;

        if (seriesId) {
          const insertMappingQuery = `
            INSERT INTO comic_book_series_mapping (comic_book_id, comic_series_id)
            VALUES ($1, $2)
            ON CONFLICT (comic_book_id, comic_series_id) DO NOTHING;
          `;

          await runQuery(insertMappingQuery, [comicBookId, seriesId]);
          console.log(
            `Inserted mapping for comic_book_id ${comicBookId} and comic_series_id ${seriesId} into comic_book_series_mapping table.`
          );
        }
      }
    } catch (err) {
      console.error(
        `Error inserting ${fileName} into comic_book or comic_book_series_mapping table:`,
        err
      );
    }
  }
};

const addFoldersToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const directories = Array.from(readFilesRecursively(dataDir).directories);

  for (const dir of directories) {
    const folderHash = generateFolderHash(dir);
    const insertFolderQuery = `
      INSERT INTO comic_folder (folder_path, folder_hash)
      VALUES ($1, $2)
      ON CONFLICT (folder_path) DO NOTHING
      RETURNING id;
    `;

    try {
      const folderResult = await runQuery(insertFolderQuery, [dir, folderHash]);
      const folderId = folderResult[0]?.id;

      if (folderId) {
        let parsedComicDetails = parseComicFolderName(dir);
        const insertSeriesQuery = `
          INSERT INTO comic_series (series_name, series_year)
          VALUES ($1, $2)
          ON CONFLICT (series_name, series_year) DO NOTHING
          RETURNING id;
        `;

        const seriesResult = await runQuery(insertSeriesQuery, [
          parsedComicDetails.series_name,
          parsedComicDetails.series_year,
        ]);
        const seriesId = seriesResult[0]?.id;

        if (seriesId) {
          const insertMappingQuery = `
            INSERT INTO comic_series_folders (series_id, folder_id)
            VALUES ($1, $2)
            ON CONFLICT (series_id, folder_id) DO NOTHING;
          `;

          await runQuery(insertMappingQuery, [seriesId, folderId]);

          console.log(
            `Inserted mapping for series_id ${seriesId} and folder_id ${folderId} into comic_series_folders table.`
          );
        }
      }
    } catch (err) {
      console.error(
        `Error inserting ${dir} into comic_folder, comic_series, or comic_series_folders table:`,
        err
      );
    }
  }
};

const getFilesWithComicInfoXml = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir).files;
  const filesWithComicInfoXml = filesList.filter(hasComicInfoXml);
  return filesWithComicInfoXml;
};

const uncompressCbzFile = (cbzFilePath) => {
  const cacheDir = process.env.CACHE_DIR;
  if (!cacheDir) {
    throw new Error("CACHE_DIR environment variable is not set");
  }

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const fileName = path.basename(cbzFilePath, path.extname(cbzFilePath));
  const outputDir = path.join(cacheDir, fileName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const zip = new AdmZip(cbzFilePath);
    zip.extractAllTo(outputDir, true);
    console.log(`Extracted ${cbzFilePath} to ${outputDir}`);
    return outputDir;
  } catch (err) {
    console.error(`Error extracting ${cbzFilePath}:`, err);
    throw err;
  }
};

export {
  listFiles,
  listFoldersWithAllowedFiles,
  addFilesToDatabase,
  addFoldersToDatabase,
  getFilesWithComicInfoXml,
  uncompressCbzFile,
};
