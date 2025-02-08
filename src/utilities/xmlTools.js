import _ from "lodash";
import { parseStringPromise } from "xml2js";
import { logger } from "./logger.js";

/*
 * This function takes a string of XML text and converts it to a JSON object.
 * @param {string} xmlText - The XML text to convert to JSON.
 * @returns {Promise<object>} - A promise that resolves to a JSON object.
 * @throws {Error} - An error if the conversion fails.
 */
export const convertComicInfoXmlTextToJson = async (xmlText) => {
  try {
    const xmlObject = await parseStringPromise(xmlText);
    return xmlObject;
  } catch (err) {
    logger.error("Error converting comicinfo.xml text to JSON:", err);
    throw err;
  }
};

/*
 * This function takes a JSON object and prints out the key-value pairs.
 * @param {object} comicInfoXmlObj - The JSON object to print out.
 * @returns {void}
 * @throws {Error} - An error if the object is not valid.
 */
export const parseAndPrintOutComicInfoXml = async (comicInfoXmlObj) => {
  for (const [key, value] of Object.entries(comicInfoXmlObj.ComicInfo)) {
    const isValueArray = _.isArray(value);
    const isValueObject = _.isObject(value);
    const isArrayOfObjects =
      isValueArray && value.every((item) => _.isObject(item));

    if (isValueObject) {
      logger.debug(`${key}: ${JSON.stringify(value)}`);
    } else if (isValueArray) {
      logger.debug(`${key}: ${value.join(", ")}`);
    } else if (isArrayOfObjects) {
      logger.debug(`${key}:`);
      logger.debug(JSON.stringify(value, null, 2));
    } else {
      logger.debug(`${key}: ${value}`);
    }
  }
};

const checkComicinfoXmlRating = (rating) => {
  // check if the rating string can be converted to a float if it can't return false
  if (isNaN(parseFloat(rating))) {
    return false;
  }

  // check if the rating value is between 0 and 5 inclusive
  if (parseFloat(rating) < 0 || parseFloat(rating) > 5) {
    return false;
  }

  // check if the rating float is at most 2 fractional digits
  if (rating.split(".")[1].length > 2) {
    return false;
  }

  return true;
}; 

/*
 * This function takes a JSON object and returns the metadata.
 * @param {object} comicInfoXmlObj - The JSON object to parse.
 * @returns {Promise<object>} - A promise that resolves to the metadata.
 * @throws {Error} - An error if the object is not valid.
 */
export const parseComicInfoXmlForMetadata = async (comicInfoXmlObj) => {
  const comicInfo = comicInfoXmlObj.ComicInfo;

  const yesNoValues = ["Yes", "No", "Unknown"];
  const mangaValues = ["Yes", "No", "Unknown", "YesAndRightToLeft"];
  const ageRatingValues = [
    "Unknown",
    "Adults Only 18+",
    "Early Childhood",
    "Everyone",
    "Everyone 10+",
    "G",
    "Kids to Adults",
    "M",
    "MA15+",
    "Mature 17+",
    "PG",
    "R18+",
    "Rating Pending",
    "Teen",
    "X18+",
  ];

  /*
    NOTE: The following fields are arrays, but we are only taking the first element, this is a result of the way the XML is parsed, that it gets all values for a key as an array
    and so we are just taking the first value assuming that the key exists in the object, this is fine since in the comicinfo schema the most each key can have is one value  
    but some values for kets such as Writer, Penciller, Inker, Colorist, Letterer, CoverArtist, Editor, Genre, Character, Team, Location, StoryArc, SeriesGroup are comma-separated arrays
    written as a string, that will need to be split into an array of strings as some point in the flow
  */
  let comicInfoMetadata = {
    title: comicInfo.Title ? comicInfo.Title[0] : null,
    seriesName: comicInfo.Series ? comicInfo.Series[0] : null,
    issueNumber: comicInfo.Number ? comicInfo.Number[0] : null,
    count: isNaN(parseInt(comicInfo.Count)) ? null : parseInt(comicInfo.Count),
    volume: comicInfo.Volume ? comicInfo.Volume[0] : null,
    altSeriesName: comicInfo.AlternateSeries ? comicInfo.AlternateSeries[0] : null,
    altIssueNumber: comicInfo.AlternateNumber ? comicInfo.AlternateNumber[0] : null,
    altCount: isNaN(parseInt(comicInfo.AlternateCount)) ? null : parseInt(comicInfo.AlternateCount),
    summary: comicInfo.Summary ? comicInfo.Summary[0] : null,
    notes: comicInfo.Notes ? comicInfo.Notes[0] : null,
    publicationDate:
      comicInfo.Day && comicInfo.Month && comicInfo.Year
        ? `${comicInfo.Month[0]}-${comicInfo.Day[0]}-${comicInfo.Year[0]}`
        : null,
    writer: comicInfo.Writer ? comicInfo.Writer[0] : null, // NOTE: comma-separated array as a string
    penciller: comicInfo.Penciller ? comicInfo.Penciller[0] : null, // NOTE: comma-separated array as a string
    inker: comicInfo.Inker ? comicInfo.Inker[0] : null, // NOTE: comma-separated array as a string
    colorist: comicInfo.Colorist ? comicInfo.Colorist[0] : null, // NOTE: comma-separated array as a string
    letterer: comicInfo.Letterer ? comicInfo.Letterer[0] : null, // NOTE: comma-separated array as a string
    coverArtist: comicInfo.CoverArtist ? comicInfo.CoverArtist[0] : null, // NOTE: comma-separated array as a string
    editor: comicInfo.Editor ? comicInfo.Editor[0] : null, // NOTE: comma-separated array
    publisher: comicInfo.Publisher ? comicInfo.Publisher[0] : null,
    imprint: comicInfo.Imprint ? comicInfo.Imprint[0] : null,
    genre: comicInfo.Genre ? comicInfo.Genre[0] : null, // NOTE: comma-separated array
    web: comicInfo.Web ? comicInfo.Web[0] : null,
    pageCount: isNaN(parseInt(comicInfo.PageCount)) ? null : parseInt(comicInfo.PageCount),
    language: comicInfo.LanguageISO ? comicInfo.LanguageISO[0] : null,
    format: comicInfo.Format ? comicInfo.Format[0] : null,
    blackAndWhite: comicInfo.BlackAndWhite && yesNoValues.includes(comicInfo.BlackAndWhite) ? comicInfo.BlackAndWhite : null,
    manga: comicInfo.Manga && mangaValues.includes(comicInfo.Manga[0]) ? comicInfo.Manga[0] : null,
    characters: comicInfo.Characters ? comicInfo.Characters[0] : null, // NOTE: comma-separated array
    teams: comicInfo.Teams ? comicInfo.Teams[0] : null, // NOTE: comma-separated array
    locations: comicInfo.Location ? comicInfo.Location[0] : null, // NOTE: comma-separated array
    scanInformation: comicInfo.ScanInformation ? comicInfo.ScanInformation[0] : null,
    storyArc: comicInfo.StoryArc ? comicInfo.StoryArc[0] : null, // NOTE: comma-separated array
    seriesGroup: comicInfo.SeriesGroup ? comicInfo.SeriesGroup[0] : null, // NOTE: comma-separated array
    ageRating: comicInfo.AgeRating && ageRatingValues.includes(comicInfo.AgeRating) ? comicInfo.AgeRating : null,
    pages: comicInfo.Pages,
    rating: comicInfo.Rating && checkComicinfoXmlRating(comicInfo.Rating) ? comicInfo.Rating : null,
    mainCharacterOrTeam: comicInfo.MainCharacterOrTeam ? comicInfo.MainCharacterOrTeam[0] : null,
    review: comicInfo.Review ? comicInfo.Review[0] : null,
  };

  return comicInfoMetadata;
};

/*
 * This function takes a JSON object and returns the roles.
 * @param {object} comicInfoXmlObj - The JSON object to parse.
 * @returns {Promise<object>} - A promise that resolves to the roles.
 * @throws {Error} - An error if the object is not valid
 */
export const parseComicInfoXmlForRoles = (comicInfoXmlObj) => {
  const roles = [
    "Writer",
    "Inker",
    "Colorist",
    "Letterer",
    "CoverArtist",
    "Editor",
  ];
  const comicInfo = comicInfoXmlObj.ComicInfo;
  const rolesArray = [];

  roles.forEach((role) => {
    if (comicInfo[role]) {
      comicInfo[role].forEach((value) => {
        value
          .split(",")
          .map((v) => v.trim())
          .forEach((val) => {
            const roleKey =
              role === "CoverArtist" ? "cover_artist" : role.toLowerCase();
            rolesArray.push({ [roleKey]: val });
          });
      });
    }
  });

  return rolesArray;
};
