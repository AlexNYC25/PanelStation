import path from "path";

const parseComicFolderName = (folderPath) => {
  const folderName = folderPath.split(path.sep).pop();
  const regex = /(.*?)(?:\s*\((\d{4})\))(?=\s*-|$)/;
  const match = folderName.match(regex);

  if (match) {
    const seriesName = match[1].trim();
    const seriesYear = match[2] ? parseInt(match[2], 10) : null;
    return { series_name: seriesName, series_year: seriesYear };
  } else {
    return { series_name: folderName, series_year: null };
  }
};

/*
  // Example usage:
  const folderPath1 = 'All New Firefly (2022)';
  const folderPath2 = 'Firefly - Bad Company (2019)';
  const folderPath3 = 'Some Series Without Year';
  
  console.log(parseComicFolderName(folderPath1)); // { series_name: 'All New Firefly', series_year: 2022 }
  console.log(parseComicFolderName(folderPath2)); // { series_name: 'Firefly - Bad Company', series_year: 2019 }
  console.log(parseComicFolderName(folderPath3)); // { series_name: 'Some Series Without Year', series_year: null }
  */

export { parseComicFolderName };
