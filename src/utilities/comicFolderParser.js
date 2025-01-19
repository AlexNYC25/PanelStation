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
  return { seriesYear: parseInt(seriesYear, 10) };
}

export const parseComicFolderNameForName = (folderPath) =>{
    // Get the last part of the folderPath (true folder name)
    const folderName = folderPath.split(/\\|\//).pop();

    // Check if the string contains "(" and get the substring up to it
    const indexOfParen = folderName.indexOf("(");
    if (indexOfParen !== -1) {
        return folderName.substring(0, indexOfParen).trim();
    }

    // If no "(", look for a 4-digit sequence
    const fourDigitMatch = folderName.match(/\d{4}/);
    if (fourDigitMatch) {
        return folderName.substring(0, fourDigitMatch.index).trim();
    }

    // If neither condition is met, return the full string
    return folderName;
}

