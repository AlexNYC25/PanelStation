import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { hasComicInfoXml } from "./comicFileParser.js";

const allowedExtensions = [".cbz", ".cbr", ".zip", ".rar"];

export const readFilesRecursively = (dir) => {
  const results = { files: [], directories: new Set() };

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

export const getFilesWithComicInfoXml = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir).files;
  const filesWithComicInfoXml = filesList.filter(hasComicInfoXml);
  return filesWithComicInfoXml;
};

export const uncompressCbzFile = (cbzFilePath) => {
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
