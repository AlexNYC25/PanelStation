import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

import { hasComicInfoXml } from "./comicFileParser.js";

const allowedExtensions = [".cbz", ".cbr", ".zip", ".rar"];

/**
 * Recursively reads files in a directory and returns an object containing files and directories.
 * @param {string} dir - The directory to read.
 * @returns {Object} An object containing files and directories.
 */
export const readFilesRecursively = (dir) => {
  const results = { files: [], directories: new Set() };

  if (typeof dir !== "string" || !fs.existsSync(dir)) {
    console.error(`Invalid directory: ${dir}`);
    return results;
  }

  try {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.join(dir, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat && fileStat.isDirectory()) {
        // Recursively read files in the directory
        const subDirResults = readFilesRecursively(filePath);

        // Filter files with allowed extensions
        const filteredFiles = subDirResults.files.filter((f) =>
          allowedExtensions.includes(path.extname(f).toLowerCase())
        );

        // Add files from subdirectory to results if they have an allowed extension
        results.files = results.files.concat(filteredFiles);

        // Add directories from subdirectory to results
        subDirResults.directories.forEach((d) => results.directories.add(d));
      } else {
        // Add file to results if it has an allowed extension
        if (allowedExtensions.includes(path.extname(file).toLowerCase())) {
          results.files.push(filePath);
          results.directories.add(dir);
        }
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }

  return results;
};

/**
 * Gets a list of files with a comicinfo.xml file from the data directory.
 * @param {string} [dir] - Optional directory to read. If not provided, uses the DATA_DIR environment variable.
 * @returns {Array} An array of file paths with a comicinfo.xml file.
 */
export const getFilesWithComicInfoXml = (dir) => {
  const dataDir = dir || process.env.DATA_DIR;

  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory does not exist: ${dataDir}`);
  }

  const filesList = readFilesRecursively(dataDir).files;
  return filesList.filter(hasComicInfoXml);
};

/**
 * Uncompresses the contents of a CBZ file into a new folder in the CACHE_DIR environment directory.
 * @param {string} cbzFilePath - The path to the CBZ file.
 * @param {string} [cacheDirPath] - Optional cache directory path. If not provided, uses the CACHE_DIR environment variable.
 * @returns {string} The path to the directory where the contents are uncompressed.
 * @throws Will throw an error if the cache directory does not exist or if there is an error during extraction.
 */
export const uncompressCbzFile = (cbzFilePath, cacheDirPath) => {
  const cacheDir = cacheDirPath || process.env.CACHE_DIR;

  if (!cacheDir) {
    throw new Error("CACHE_DIR environment variable is not set");
  }

  if (!fs.existsSync(cacheDir)) {
    throw new Error(`Cache directory does not exist: ${cacheDir}`);
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

/**
 * Compresses multiple CBZ files into a single ZIP file in the CACHE_DIR environment directory.
 * @param {Array<string>} cbzFiles - An array of paths to the CBZ files to compress.
 * @param {string} [cacheDirPath] - Optional cache directory path. If not provided, uses the CACHE_DIR environment variable.
 * @returns {string} The path to the created ZIP file.
 * @throws Will throw an error if the cache directory does not exist or if there is an error during compression.
 */
export const compressMultipleCbzFiles = (cbzFiles, cacheDirPath) => {
  const cacheDir = cacheDirPath || process.env.CACHE_DIR;

  if (!cacheDir) {
    throw new Error("CACHE_DIR environment variable is not set");
  }

  if (!fs.existsSync(cacheDir)) {
    throw new Error(`Cache directory does not exist: ${cacheDir}`);
  }

  const zip = new AdmZip();
  cbzFiles.forEach((cbzFile) => {
    // Check if cbzFile is a string and exists
    if (typeof cbzFile !== "string" || !fs.existsSync(cbzFile)) {
      console.error(`Invalid file: ${cbzFile}`);
      return;
    }

    zip.addLocalFile(cbzFile);
  });

  const zipFileName = `${Date.now()}.zip`;
  const zipFilePath = path.join(cacheDir, zipFileName);
  zip.writeZip(zipFilePath);

  console.log(`Compressed files to ${zipFilePath}`);
  return zipFilePath;
};
