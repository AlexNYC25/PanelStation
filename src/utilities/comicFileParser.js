import path from 'path'
import AdmZip from 'adm-zip'

export const parseComicFileName = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath))
  let parsedSeriesDetails = {
    series_name: null,
    series_year: null,
    issue_number: 1
  }

  const doesFileNameContainSpace = fileName.includes(' ')
  let fileNameParts = [];

  if (doesFileNameContainSpace) {
    fileNameParts.push(fileName.split(' '))
  } else {
    fileNameParts.push(fileName.split('_'))
  }

  const seriesNameParts = []
  const seriesYearParts = []
  const issueNumberParts = []

  // Find the location and extract part of the filename that contains the series year ex. (2022)
  for (let i = 0; i < fileNameParts[0].length; i++) {
    if (fileNameParts[0][i].includes('(') && fileNameParts[0][i].includes(')')) {
      seriesYearParts.push(fileNameParts[0][i])
    }
  }

  // Remove the series year from the filename and all parts after it in the filenameParts array
  if (seriesYearParts.length > 0) {
    const seriesYearIndex = fileNameParts[0].indexOf(seriesYearParts[0])
    fileNameParts[0].splice(seriesYearIndex, fileNameParts[0].length - seriesYearIndex)
  }

  // check the last part of the filename to see if it contains the issue number or in the format of #001 or 001
  const lastPart = fileNameParts[0][fileNameParts[0].length - 1]
  if (lastPart.includes('#')) {
    issueNumberParts.push(lastPart.split('#')[1])
  } else if (lastPart.match(/\d+/)) {
    issueNumberParts.push(lastPart)
  } else if (lastPart.includes('v')) {
    issueNumberParts.push(lastPart.split('v')[1])
  }

  // Remove the issue number from the filename and all parts after it in the filenameParts array
  if (issueNumberParts.length > 0) {
    const issueNumberIndex = fileNameParts[0].indexOf(issueNumberParts[0])
    fileNameParts[0].splice(issueNumberIndex, fileNameParts[0].length - issueNumberIndex)
  }

  // Combine the remaining parts of the filename to get the series name
  for (let i = 0; i < fileNameParts[0].length; i++) {
    seriesNameParts.push(fileNameParts[0][i])
  }

  parsedSeriesDetails.series_name = seriesNameParts.join(' ')
  parsedSeriesDetails.series_year = seriesYearParts.length > 0 ? "01-01-" + seriesYearParts[0].replace("(", "").replace(")", "") : null
  parsedSeriesDetails.issue_number = issueNumberParts.length > 0 ? Number.parseFloat(issueNumberParts[0]) : 1

  return parsedSeriesDetails
}

export const hasComicInfoXml = (cbzFilePath) => {
  try {
    const zip = new AdmZip(cbzFilePath)
    const zipEntries = zip.getEntries()
    return zipEntries.some(
      (entry) => entry.entryName.toLowerCase() === 'comicinfo.xml'
    )
  } catch (err) {
    console.error(`Error reading ${cbzFilePath}:`, err)
    return false
  }
}

export const extractComicInfoXml = (cbzFilePath) => {
  try {
    const zip = new AdmZip(cbzFilePath)
    const zipEntries = zip.getEntries()
    const comicInfoXmlEntry = zipEntries.find(
      (entry) => entry.entryName.toLowerCase() === 'comicinfo.xml'
    )

    if (comicInfoXmlEntry) {
      return zip.readAsText(comicInfoXmlEntry)
    } else {
      return null
    }
  } catch (err) {
    console.error(`Error reading ${cbzFilePath}:`, err)
    return null
  }
}

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
