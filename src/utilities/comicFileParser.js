import fs from "fs";
import path from "path";

const parseComicFileName = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const regex = /^(.*?)(?:\s+\d{3}\s*\(\d{4}\))/;
  const match = fileName.match(regex);

  if (match) {
    const seriesName = match[1].trim();
    return { series_name: seriesName };
  } else {
    return { series_name: fileName };
  }
};

const hasComicInfoXml = (cbzFilePath) => {
  try {
    const zip = new AdmZip(cbzFilePath);
    const zipEntries = zip.getEntries();
    return zipEntries.some(
      (entry) => entry.entryName.toLowerCase() === "comicinfo.xml"
    );
  } catch (err) {
    console.error(`Error reading ${cbzFilePath}:`, err);
    return false;
  }
};

/*
// Example usage:
const filePath1 = 'All-New Firefly 003 (2022) (digital) (Knight Ripper-Empire).cbz';
const filePath2 = 'Firefly - Bad Company 001 (2019) (digital) (Knight Ripper-Empire).cbz';
const filePath3 = 'Some Series Without Issue Number (2022) (digital) (Knight Ripper-Empire).cbz';

console.log(parseComicFileName(filePath1)); // { series_name: 'All-New Firefly' }
console.log(parseComicFileName(filePath2)); // { series_name: 'Firefly - Bad Company' }
console.log(parseComicFileName(filePath3)); // { series_name: 'Some Series Without Issue Number' }

console.log(hasComicInfoXml(filePath1)); // true or false
console.log(hasComicInfoXml(filePath2)); // true or false
console.log(hasComicInfoXml(filePath3)); // true or false
*/

export { parseComicFileName, hasComicInfoXml };
