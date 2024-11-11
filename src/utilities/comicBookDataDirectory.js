import fs from "fs";
import path from "path";

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

export { getFilesList };