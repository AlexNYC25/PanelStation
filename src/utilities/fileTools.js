import path from "path";

/**
 *This function takes a file path and returns the file name and the parent directory of the file.
 *
 *@param {string} filePath - The file path to parse.
 *@returns {object} - An object containing the file name and the parent directory.
 */
export const getfileNameAndParentDirFromPath = (filePath) => {
  const fileName = path.basename(filePath);
  const parentDir = path.dirname(filePath);
  return { fileName, parentDir };
};
