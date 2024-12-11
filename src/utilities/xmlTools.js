import { isObject, isArray } from "lodash";
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
    const isValueArray = isArray(value);
    const isValueObject = isObject(value);
    const isArrayOfObjects =
      isValueArray && value.every((item) => isObject(item));

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

/*
 * This function takes a JSON object and returns the metadata.
 * @param {object} comicInfoXmlObj - The JSON object to parse.
 * @returns {Promise<object>} - A promise that resolves to the metadata.
 * @throws {Error} - An error if the object is not valid.
 */
export const parseComicInfoXmlForMetadata = async (comicInfoXmlObj) => {
  const comicInfo = comicInfoXmlObj.ComicInfo;

  let comicInfoMetadata = {
    series_name: comicInfo.Series ? comicInfo.Series[0] : null,
    title: comicInfo.Title ? comicInfo.Title[0] : null,
    issue_number: comicInfo.Number ? comicInfo.Number[0] : null,
    publisher: comicInfo.Publisher ? comicInfo.Publisher[0] : null,
    publication_date:
      comicInfo.Day && comicInfo.Month && comicInfo.Year
        ? `${comicInfo.Month[0]}-${comicInfo.Day[0]}-${comicInfo.Year[0]}`
        : null,
    summary: comicInfo.Summary ? comicInfo.Summary[0] : null,
    genre: comicInfo.Genre ? comicInfo.Genre[0] : null,
    page_count: comicInfo.PageCount
      ? comicInfo.PageCount[0]
      : comicInfo.Pages[0].Page.length,
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
