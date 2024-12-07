import { parseStringPromise } from "xml2js";

export const convertComicInfoXmlTextToJson = async (xmlText) => {
  try {
    const result = await parseStringPromise(xmlText);
    return result;
  } catch (err) {
    console.error("Error converting comicinfo.xml text to JSON:", err);
    throw err;
  }
};

export const parseAndPrintOutComicInfoXml = async (comicInfoXmlObj) => {
  for (const [key, value] of Object.entries(comicInfoXmlObj.ComicInfo)) {
    const isValueArray = Array.isArray(value);
    const isValueObject = typeof value === "object";
    const isArrayOfObjects =
      isValueArray && value.every((item) => typeof item === "object");

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

export const parseComicInfoXmlForMetadata = async (comicInfoXmlObj) => {
  const metadata = {
    series_name: null,
    title: null,
    issue_number: null,
    publisher: null,
    publication_date: null,
    summary: null,
    genre: null,
    page_count: null,
  };

  const comicInfo = comicInfoXmlObj.ComicInfo;

  if (comicInfo.Series) {
    metadata.series_name = comicInfo.Series[0];
  }

  if (comicInfo.Title) {
    metadata.title = comicInfo.Title[0];
  }

  if (comicInfo.Number) {
    metadata.issue_number = comicInfo.Number[0];
  }

  if (comicInfo.Publisher) {
    metadata.publisher = comicInfo.Publisher[0];
  }

  if (comicInfo.Day && comicInfo.Month && comicInfo.Year) {
    metadata.publication_date = `${comicInfo.Month[0]}-${comicInfo.Day[0]}-${comicInfo.Year[0]}`;
  }

  if (comicInfo.Summary) {
    metadata.summary = comicInfo.Summary[0];
  }

  if (comicInfo.Genre) {
    metadata.genre = comicInfo.Genre[0];
  }

  if (comicInfo.PageCount) {
    metadata.page_count = comicInfo.PageCount[0];
  } else {
    metadata.page_count = comicInfo.Pages[0].Page.length;
  }

  return metadata;
};

export const parseComicInfoXmlForRoles = async (comicInfoXmlObj) => {
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
        const values = value.split(',').map(v => v.trim());
        values.forEach((val) => {
          const roleObject = {};
          if (role === "Writer") {
            roleObject.writer = val;
          } else if (role === "Inker") {
            roleObject.inker = val;
          } else if (role === "Colorist") {
            roleObject.colorist = val;
          } else if (role === "Letterer") {
            roleObject.letterer = val;
          } else if (role === "CoverArtist") {
            roleObject.cover_artist = val;
          } else if (role === "Editor") {
            roleObject.editor = val;
          }
          rolesArray.push(roleObject);
        });
      });
    }
  });

  return rolesArray;
};
