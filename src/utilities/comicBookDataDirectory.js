import fs from "fs";
import path from "path";

import { runQuery } from "../config/dbConnection.js";

const readFilesRecursively = (dir) => {
  let results = [];
  const allowedExtensions = ['.cbz', '.cbr', '.zip', '.rar'];

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      // Recursively read files in the directory
      results = results.concat(readFilesRecursively(filePath));
    } else {
      // Add file to results if it has an allowed extension
      if (allowedExtensions.includes(path.extname(file).toLowerCase())) {
        results.push(filePath);
      }
    }
  });

  return results;
};

const getFilesList = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir);
  return JSON.stringify(filesList, null, 2);
};

const addFilesToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir);

  for (const filePath of filesList) {
    const fileName = path.basename(filePath);
    const insertQuery = `
      INSERT INTO comic_book (file_name, file_path)
      VALUES ($1, $2)
      ON CONFLICT (file_path) DO NOTHING;
    `;

    try {
      await runQuery(insertQuery, [fileName, filePath]);
      console.log(`Inserted ${fileName} into comic_book table.`);
    } catch (err) {
      console.error(`Error inserting ${fileName} into comic_book table:`, err);
    }
  }
};

export { getFilesList, addFilesToDatabase };