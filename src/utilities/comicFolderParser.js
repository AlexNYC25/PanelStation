import path from 'path'

/**
 * Parses a folder name to extract the series name and year.
 * @param {string} folderPath - The path to the folder.
 * @returns {Object} An object containing the series name and year.
 */
export const parseComicFolderName = (folderPath) => {
  const folderName = path.basename(folderPath);
  const dateRegex = /^(.*?)(?:\s*\((\d{4})\))?$/;
  const match = folderName.match(dateRegex);

  const seriesName = match && match[1] ? match[1].trim() : folderName;
  const seriesYear = match && match[2] ? parseInt(match[2], 10) : null;

  return { series_name: seriesName, series_year: seriesYear };
};

export const parseComicFolderNameForYear = (folderPath) => {
  const folderName = path.basename(folderPath);
  const dateRegex = /\(\d{4}\)/g;
  const match = folderName.match(dateRegex);

  const seriesYear = match[0].replace('(', '').replace(')', '');
  return { seriesYear };
}

