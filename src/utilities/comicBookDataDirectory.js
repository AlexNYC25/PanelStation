import fs from "fs";
import path from "path";
import crypto from "crypto";

import { runQuery } from "../config/dbConnection.js";

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

  const filesList = readFilesRecursively(dataDir);

  for (const filePath of filesList) {
    const fileName = path.basename(filePath);
    const fileHash = generateFileHash(filePath);
    const insertQuery = `
      INSERT INTO comic_book (file_name, file_path, file_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (file_path) DO NOTHING;
    `;

    try {
      await runQuery(insertQuery, [fileName, filePath, fileHash]);
      console.log(`Inserted ${fileName} into comic_book table.`);
    } catch (err) {
      console.error(`Error inserting ${fileName} into comic_book table:`, err);
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
    const insertQuery = `
      INSERT INTO comic_folder (folder_path, folder_hash)
      VALUES ($1, $2)
      ON CONFLICT (folder_path) DO NOTHING;
    `;

    try {
      await runQuery(insertQuery, [dir, folderHash]);
      console.log(`Inserted ${dir} into comic_folder table.`);
    } catch (err) {
      console.error(`Error inserting ${dir} into comic_folder table:`, err);
    }
  }
};

export {
  listFiles,
  listFoldersWithAllowedFiles,
  addFilesToDatabase,
  addFoldersToDatabase,
};
