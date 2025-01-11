import _ from "lodash";
import { parseStringPromise } from "xml2js";

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
    console.error("Error converting comicinfo.xml text to JSON:", err);
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
      console.log(`${key}: ${JSON.stringify(value)}`);
    } else if (isValueArray) {
      console.log(`${key}: ${value.join(", ")}`);
    } else if (isArrayOfObjects) {
      console.log(`${key}:`);
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log(`${key}: ${value}`);
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

  let comicInfoMetadata = {
    title: comicInfo.Title,
    seriesName: comicInfo.Series,
    issueNumber: comicInfo.Number,
    count: comicInfo.Count,
    volume: comicInfo.Volume,
    altSeriesName: comicInfo.AlternateSeries,
    altIssueNumber: comicInfo.AlternateNumber,
    altCount: comicInfo.AlternateCount,
    summary: comicInfo.Summary,
    notes: comicInfo.Notes,
    publicationDate:
      comicInfo.Day && comicInfo.Month && comicInfo.Year
        ? `${comicInfo.Month[0]}-${comicInfo.Day[0]}-${comicInfo.Year[0]}`
        : null,
    writer: comicInfo.Writer, // NOTE: comma-separated array
    penciller: comicInfo.Penciller, // NOTE: comma-separated array
    inker: comicInfo.Inker, // NOTE: comma-separated array
    colorist: comicInfo.Colorist, // NOTE: comma-separated array
    letterer: comicInfo.Letterer, // NOTE: comma-separated array
    coverArtist: comicInfo.CoverArtist, // NOTE: comma-separated array
    editor: comicInfo.Editor, // NOTE: comma-separated array
    publisher: comicInfo.Publisher,
    imprint: comicInfo.Imprint,
    genre: comicInfo.Genre ? comicInfo.Genre : null,
    web: comicInfo.Web,
    pageCount: comicInfo.PageCount ? comicInfo.PageCount: comicInfo.Pages[0].Page.length,
    language: comicInfo.LanguageISO,
    format: comicInfo.Format,
    blackAndWhite: comicInfo.BlackAndWhite && yesNoValues.includes(comicInfo.BlackAndWhite) ? comicInfo.BlackAndWhite : null,
    manga: comicInfo.Manga && mangaValues.includes(comicInfo.Manga) ? comicInfo.Manga : null,
    characters: comicInfo.Character, // NOTE: comma-separated array
    teams: comicInfo.Team, // NOTE: comma-separated array
    locations: comicInfo.Location, // NOTE: comma-separated array
    scanInformation: comicInfo.ScanInformation,
    storyArc: comicInfo.StoryArc, // NOTE: comma-separated array
    seriesGroup: comicInfo.SeriesGroup, // NOTE: comma-separated array
    ageRating: comicInfo.AgeRating && ageRatingValues.includes(comicInfo.AgeRating) ? comicInfo.AgeRating : null,
    pages: comicInfo.Pages,
    rating: comicInfo.Rating && checkComicinfoXmlRating(comicInfo.Rating) ? comicInfo.Rating : null,
    mainCharacterOrTeam: comicInfo.MainCharacterOrTeam,
    review: comicInfo.Review,
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
