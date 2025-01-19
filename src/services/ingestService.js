import _ from "lodash";

import {
  generateFolderHash,
  generateFileHash,
} from "../utilities/hashTools.js";
import {
  convertComicInfoXmlTextToJson,
  parseComicInfoXmlForMetadata,
} from "../utilities/xmlTools.js";
import {
  parseComicFolderNameForYear,
  parseComicFolderNameForName,
} from "../utilities/comicFolderParser.js";
import { readFilesRecursively } from "../utilities/comicBookDataDirectory.js";
import {
  hasComicInfoXml,
  extractComicInfoXml,
} from "../utilities/comicFileParser.js";
import { getfileNameAndParentDirFromPath } from "../utilities/fileTools.js";
import { logger } from "../utilities/logger.js";

import {
  insertComicFolderIntoDb,
  getComicFolderUsingHash,
} from "../models/comicFolder.js";
import {
  insertComicSeriesIntoDb,
  findSeriesIdFromSeriesNameAndYearInDb,
} from "../models/comicSeries.js";
import {
  getComicBookByHash,
  insertComicBookIntoDb,
} from "../models/comicBook.js";
import {
  insertMappingIntoComicSeriesFolders,
  findMappingInComicSeriesFolders,
} from "../models/comicSeriesFolders.js";
import { insertComicBookSeriesMappingIntoDb } from "../models/comicBookSeriesMapping.js";
import { insertComicBookMetadataIntoDb } from "../models/comicBookMetadata.js";
import {
  insertComicBookRolesIntoDb,
  checkRoleInDB,
  getComicBookRolesId,
} from "../models/comicBookRoles.js";
import { insertComicBookMetadataRolesIntoDb } from "../models/comicBookMetadataRoles.js";

/**
 * Service function to check if the DATA_DIR environment variable is set.
 * @returns {void}
 * @throws {Error} - An error if the DATA_DIR environment variable is not set.
 */
const ensureDataDirIsInPlace = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }
};

/**
 * Service function to get the files in the data directory.
 * @returns {Array} - An array of file paths.
 * @throws {Error} - An error if there is an issue reading the files in the data directory.
 * @throws {Error} - An error if no files are found in the data directory.
 */
const getTheFilesInOurDataDir = () => {
  // We assume that the data directory is set in the environment variables.
  const dataDir = process.env.DATA_DIR;

  const filesList = readFilesRecursively(dataDir).files;

  if (!filesList) {
    throw new Error("Error reading files in the data directory.");
  }

  if (filesList.length === 0) {
    throw new Error("No files found in the data directory.");
  }

  return filesList;
};

const getTheComicBookFilesInOurDataDir = () => {
  const filesList = getTheFilesInOurDataDir();

  const comicBookFiles = filesList.filter((file) => {
    return (
      file.endsWith(".cbz") ||
      file.endsWith(".cbr") ||
      file.endsWith(".cb7") ||
      file.endsWith(".pdf") ||
      file.endsWith(".epub")
    );
  });

  return comicBookFiles;
};

/**
 * Service function to gather the initial properties of a comic book file.
 * @param {String} filePath - The file path of the comic book file.
 * @returns {Object} - An object containing the file name, parent directory, and file hash.
 * @throws {Error} - An error if there is an issue extracting the file name and parent directory from the file path.
 * @throws {Error} - An error if there is an issue generating the file hash.
 */
const gatherInitialComicBookFileProperties = (filePath) => {
  // Extract the file name and the parent directory of the file.
  const { fileName, parentDir } = getfileNameAndParentDirFromPath(filePath);

  if (!fileName || !parentDir) {
    throw new Error(
      "Error extracting file name and parent directory from path: " + filePath
    );
  }

  // Generate a hash for the file, this hash will be used to check if the file already exists in the database.
  const fileHash = generateFileHash(filePath);

  if (!fileHash) {
    throw new Error("Error generating file hash for file: " + filePath);
  }

  return { fileName: fileName, filePath: filePath, fileHash: fileHash };
};

const getParentFolderFromFilePath = (filePath) => {
  const { parentDir } = getfileNameAndParentDirFromPath(filePath);
  return parentDir;
};

/**
 * Service function to check if the current comic book exists in the database.
 * @param {String} fileHash - The hash of the comic book file.
 * @returns {Object} - An object containing a boolean indicating if the comic book exists in the database and the comic book id.
 * @throws {Error} - An error if there is an issue querying the database for the comic book.
 */
const checkIfCurrentComicBookExistsInDatabase = async (fileHash) => {
  try {
    let comicBookResultsArray = await getComicBookByHash(fileHash);

    if (comicBookResultsArray.length > 0) {
      return {
        comicBookExists: true,
        comicBookId: comicBookResultsArray[0].id,
      };
    } else {
      return { comicBookExists: false, comicBookId: null };
    }
  } catch (err) {
    throw new Error(
      "Error querying the database for the comic book: " + fileHash
    );
  }
};

/**
 * Service function to add the comic book file to the database, when the comic book does not already exist in the database.
 * @param {Object} fileInfo - An object containing the file name, parent directory, and file hash.
 * @returns {Promise} - A promise that resolves to the comic book id as an integer.
 * @throws {Error} - An error if there is an issue inserting the comic book into the database.
 * @throws {Error} - An error if the comic book id is not an integer.
 * @throws {Error} - An error if the comic book id is null.
 */
const addTheComicBookFileToDatabase = async (fileInfo) => {
  let comicBookId = null;
  let insertComicBookResult = null;

  try {
    insertComicBookResult = await insertComicBookIntoDb(fileInfo);
  } catch (err) {
    logger.error(
      "Error inserting comic book at " + fileInfo.filePath + " :",
      err
    );
    throw new Error(
      "Error inserting comic book at " + fileInfo.filePath + " :",
      err
    );
  }

  if (insertComicBookResult?.success) {
    comicBookId = insertComicBookResult.comicBookId;

    logger.debug(
      `Inserted file ${fileInfo.fileName} into comic_book table, with the id ${fileInfo.comicBookId}`
    );
  }

  // check that the comic book id is not null.
  if (!comicBookId) {
    throw new Error("Error inserting comic book at " + fileInfo.filePath);
  }

  // check if the comic book id is an integer.
  if (!Number.isInteger(comicBookId)) {
    throw new Error("Error retured comic book id is not an integer.");
  }

  return Promise.resolve(Number.parseInt(comicBookId));
};

/**
 * Service function to get the comic book comic info xml data if it exists.
 * @param {String} filePath - The file path of the comic book file.
 * @returns {Object} - An object containing the comic book metadata.
 * @returns {null} - If the comic book does not have a comic info xml file.
 * @throws {Error} - An error if there is an issue parsing the comic info xml.
 * @throws {Error} - An error if there is an issue converting the comic info xml text to json.
 * @throws {Error} - An error if there is an issue extracting the comic info xml from the comic book file.
 */
const getComicBookComicInfoXmlData = async (filePath) => {
  const doesTheComicBookHaveComicInfoXml = hasComicInfoXml(filePath);

  if (!doesTheComicBookHaveComicInfoXml) {
    return null;
  }

  let parsedComicInfoXml = null;
  try {
    // first we read the raw xml data from the comic book file.
    const rawComicInfoXml = extractComicInfoXml(filePath);
    // then we convert the raw xml data to json.
    const jsonComicInfoXml = await convertComicInfoXmlTextToJson(
      rawComicInfoXml
    );
    // then we parse the json data to extract the metadata and ensure it is in the correct format.
    parsedComicInfoXml = await parseComicInfoXmlForMetadata(jsonComicInfoXml);
  } catch (err) {
    logger.error("Error parsing comic info xml:", err);
  }

  return parsedComicInfoXml;
};

/**
 * Service function to add the comic book metadata to the database.
 * @param {Number} comicBookId - The id of the comic book in the database.
 * @param {Object} comicFileXmlData - The comic book metadata.
 * @returns {Promise} - A promise that resolves to the result of the database insert.
 */
const addComicBookMetadataToDatabase = async (
  comicBookId,
  comicFileXmlData
) => {
  let insertMetadataResult = null;

  try {
    insertMetadataResult = await insertComicBookMetadataIntoDb({
      comicBookId,
      seriesName: comicFileXmlData.seriesName,
      title: comicFileXmlData.title,
      issueNumber: comicFileXmlData.issueNumber,
      count: comicFileXmlData.count,
      volume: comicFileXmlData.volume,
      altSeriesName: comicFileXmlData.altSeriesName,
      altIssueNumber: comicFileXmlData.altIssueNumber,
      altCount: comicFileXmlData.altCount,
      summary: comicFileXmlData.summary,
      notes: comicFileXmlData.notes,
      publicationDate: comicFileXmlData.publicationDate,
      web: comicFileXmlData.web,
      pageCount: comicFileXmlData.pageCount,
      format: comicFileXmlData.format,
      scanInformation: comicFileXmlData.scanInformation,
      rating: comicFileXmlData.rating,
      mainCharacterOrTeam: comicFileXmlData.mainCharacterOrTeam,
      review: comicFileXmlData.review,
    });
  } catch (err) {
    logger.error("Error inserting metadata:", err);
  }

  if (insertMetadataResult?.success) {
    logger.debug(
      `Inserted metadata for comic book ${comicBookId} into comic_book_metadata table.`
    );
  }

  return Promise.resolve(insertMetadataResult?.id);
};

/**
 * Service function to add the comic book roles to the database.
 * @param {Obbject} comicFileXmlData - The comic book metadata.
 * @returns {Promise} - A promise that resolves to an array of the comic book roles ids in the database.
 */
const addComicBookRolesToDatabase = async (comicFileXmlData) => {
  if (!comicFileXmlData) {
    return;
  }

  let rolesIds = [];

  if (comicFileXmlData.writer) {
    let writers = comicFileXmlData.writer.split(",");
    writers = writers.map((writer) => {
      return writer.trim();
    });

    for (const writer of writers) {
      let roleIsAlreadyInDb = await checkRoleInDB("writer", writer);

      if (!roleIsAlreadyInDb) {
        let writerInsertionResult = null;
        try {
          writerInsertionResult = await insertComicBookRolesIntoDb({
            writer: writer,
          });
        } catch (err) {
          logger.error("Error inserting writer:", err);
        }

        if (writerInsertionResult?.success) {
          rolesIds.push(writerInsertionResult.comicBookRolesId);
        }
      } else {
        let writerId = await getComicBookRolesId("writer", writer);
        rolesIds.push(writerId);
      }
    }
  }

  if (comicFileXmlData.penciller) {
    let pencillers = comicFileXmlData.penciller.split(",");
    pencillers = pencillers.map((penciller) => {
      return penciller.trim();
    });

    for (const penciller of pencillers) {
      let roleIsAlreadyInDb = await checkRoleInDB("penciller", penciller);

      if (!roleIsAlreadyInDb) {
        let pencillerInsertionResult = null;
        try {
          pencillerInsertionResult = await insertComicBookRolesIntoDb({
            penciller: penciller,
          });
        } catch (err) {
          logger.error("Error inserting penciller:", err);
        }

        if (pencillerInsertionResult?.success) {
          rolesIds.push(pencillerInsertionResult.comicBookRolesId);
        }
      } else {
        let pencillerId = await getComicBookRolesId("penciller", penciller);
        rolesIds.push(pencillerId);
      }
    }
  }

  if (comicFileXmlData.inker) {
    let inkers = comicFileXmlData.inker.split(",");
    inkers = inkers.map((inker) => {
      return inker.trim();
    });

    for (const inker of inkers) {
      let roleIsAlreadyInDb = await checkRoleInDB("inker", inker);

      if (!roleIsAlreadyInDb) {
        let inkerInsertionResult = null;
        try {
          inkerInsertionResult = await insertComicBookRolesIntoDb({
            inker: inker,
          });
        } catch (err) {
          logger.error("Error inserting inker:", err);
        }

        if (inkerInsertionResult?.success) {
          rolesIds.push(inkerInsertionResult.comicBookRolesId);
        }
      } else {
        let inkerId = await getComicBookRolesId("inker", inker);
        rolesIds.push(inkerId);
      }
    }
  }

  if (comicFileXmlData.colorist) {
    let colorists = comicFileXmlData.colorist.split(",");
    colorists = colorists.map((colorist) => {
      return colorist.trim();
    });

    for (const colorist of colorists) {
      let roleIsAlreadyInDb = await checkRoleInDB("colorist", colorist);

      if (!roleIsAlreadyInDb) {
        let coloristInsertionResult = null;
        try {
          coloristInsertionResult = await insertComicBookRolesIntoDb({
            colorist: colorist,
          });
        } catch (err) {
          logger.error("Error inserting colorist:", err);
        }

        if (coloristInsertionResult?.success) {
          rolesIds.push(coloristInsertionResult.comicBookRolesId);
        }
      } else {
        let coloristId = await getComicBookRolesId("colorist", colorist);
        rolesIds.push(coloristId);
      }
    }
  }

  if (comicFileXmlData.letterer) {
    let letterers = comicFileXmlData.letterer.split(",");
    letterers = letterers.map((letterer) => {
      return letterer.trim();
    });

    for (const letterer of letterers) {
      let roleIsAlreadyInDb = await checkRoleInDB("letterer", letterer);

      if (!roleIsAlreadyInDb) {
        let lettererInsertionResult = null;
        try {
          lettererInsertionResult = await insertComicBookRolesIntoDb({
            letterer: letterer,
          });
        } catch (err) {
          logger.error("Error inserting letterer:", err);
        }

        if (lettererInsertionResult?.success) {
          rolesIds.push(lettererInsertionResult.comicBookRolesId);
        }
      } else {
        let lettererId = await getComicBookRolesId("letterer", letterer);
        rolesIds.push(lettererId);
      }
    }
  }

  if (comicFileXmlData.coverArtist) {
    let coverArtists = comicFileXmlData.coverArtist.split(",");
    coverArtists = coverArtists.map((coverArtist) => {
      return coverArtist.trim();
    });

    for (const coverArtist of coverArtists) {
      let roleIsAlreadyInDb = await checkRoleInDB("cover_artist", coverArtist);

      if (!roleIsAlreadyInDb) {
        let coverArtistInsertionResult = null;
        try {
          coverArtistInsertionResult = await insertComicBookRolesIntoDb({
            cover_artist: coverArtist,
          });
        } catch (err) {
          logger.error("Error inserting cover artist:", err);
        }

        if (coverArtistInsertionResult?.success) {
          rolesIds.push(coverArtistInsertionResult.comicBookRolesId);
        }
      } else {
        let coverArtistId = await getComicBookRolesId(
          "cover_artist",
          coverArtist
        );
        rolesIds.push(coverArtistId);
      }
    }
  }

  if (comicFileXmlData.editor) {
    let editors = comicFileXmlData.editor.split(",");
    editors = editors.map((editor) => {
      return editor.trim();
    });

    for (const editor of editors) {
      let roleIsAlreadyInDb = await checkRoleInDB("editor", editor);

      if (!roleIsAlreadyInDb) {
        let editorInsertionResult = null;
        try {
          editorInsertionResult = await insertComicBookRolesIntoDb({
            editor: editor,
          });
        } catch (err) {
          logger.error("Error inserting editor:", err);
        }

        if (editorInsertionResult?.success) {
          rolesIds.push(editorInsertionResult.comicBookRolesId);
        }
      } else {
        let editorId = await getComicBookRolesId("editor", editor);
        rolesIds.push(editorId);
      }
    }
  }

  return Promise.resolve(rolesIds);
};

/**
 * Service function to add the relationship between a comic book's metadata and its roles.
 * @param {Number} metadataId - The id of the comic book metadata in the database.
 * @param {Array} rolesIds - An array of the comic book roles ids in the database.
 * @returns {Promise} - A promise that resolves to the result of the database insert.
 */
const addComicBookMetadataRolesToDatabase = async (metadataId, rolesIds) => {
  let metadataRolesIds = [];

  for (const roleId of rolesIds) {
    let insertMetadataRolesResult = null;
    try {
      insertMetadataRolesResult = await insertComicBookMetadataRolesIntoDb({
        metadataId,
        roleId,
      });
    } catch (err) {
      logger.error("Error inserting metadata roles:", err);
    }

    if (insertMetadataRolesResult?.success) {
      logger.debug(
        `Inserted metadata roles for comic book metadata ${metadataId} into comic_book_metadata_roles table.`
      );
      metadataRolesIds.push(insertMetadataRolesResult.id);
    }
  }

  return Promise.resolve(metadataRolesIds);
};

/**
 * Service function to check if the comic folder already exists in the database.
 * @param {String} comicFolderDir - The directory of the comic folder.
 * @returns {Promise(Bool)} - A boolean indicating if the comic folder exists in the database.
 */
const checkIfComicFolderExistsInDatabase = async (comicFilePath) => {
  const comicFolderDir = getParentFolderFromFilePath(comicFilePath);

  // Generate a hash for the folder, this hash will be used to check if the folder already exists in the database.
  const folderHash = generateFolderHash(comicFolderDir);

  let comicFolderId = null;
  let findComicFolderResult = null;

  try {
    findComicFolderResult = await getComicFolderUsingHash(folderHash);
    comicFolderId = findComicFolderResult?.id;
  } catch (err) {
    logger.error("Error getting comic folder by hash:", err);
  }

  if (comicFolderId) {
    logger.debug(
      `Comic folder ${comicFolderDir} already exists in the database.`
    );
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
};

/**
 * Service function to add the comic folder to the database.
 * @param {String} comicFolderDir - The directory of the comic folder.
 * @returns {Promise(Number)} - The id of the comic folder in the database.
 * @returns {Promise(null)} - If the comic folder already exists in the database.
 */
const addComicFolderToDatabase = async (comicFilePath) => {
  const comicFolderDir = getParentFolderFromFilePath(comicFilePath);
  // Generate a hash for the folder, this hash will be used to check if the folder already exists in the database.
  const folderHash = generateFolderHash(comicFolderDir);

  let comicFolderId = null;
  let insertFolderResult = null;

  try {
    insertFolderResult = await insertComicFolderIntoDb({
      folderPath: comicFolderDir,
      folderHash,
    });
  } catch (err) {
    logger.error("Error inserting folder:", err);
  }

  if (insertFolderResult?.success) {
    comicFolderId = insertFolderResult.comicFolderId;
    if (!comicFolderId) {
      logger.debug(`Folder ${comicFolderDir} already exists in the database.`);
    } else {
      logger.debug(
        `Inserted folder ${comicFolderDir} into comic_folder table, with the id ${comicFolderId}`
      );
    }
  }

  return comicFolderId;
};

/**
 * Service function to check if the comic series already exists in the database.
 * @param {String} seriesYear - The year of the comic series.
 * @param {String} seriesName - The name of the comic series.
 * @returns {Promise(Boolean)} - A boolean indicating if the comic series exists in the database.
 */
const checkIfComicSeriesExistsInDatabase = async (seriesYear, seriesName) => {
  let seriesId = null;
  let findSeriesResult = null;

  try {
    findSeriesResult = await findSeriesIdFromSeriesNameAndYearInDb(
      seriesName,
      seriesYear
    );
    seriesId = findSeriesResult?.id;
  } catch (err) {
    logger.error("Error finding series:", err);
  }

  if (seriesId) {
    logger.debug(`Comic series ${seriesName} already exists in the database.`);
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
};

/**
 * Service function to add the comic book series to the database.
 * @param {String} seriesYear - The year of the comic book series.
 * @param {String} seriesName - The name of the comic book series.
 * @returns {Promise(Number)} - The id of the comic series in the database.
 * @returns {Promise(null)} - If the comic series already exists in the database.
 */
const addSeriesToDatabase = async (seriesYear, seriesName) => {
  let seriesId = null;
  let insertSeriesResult = null;

  if (!seriesName || !seriesYear) {
    logger.error(
      "Error adding series to database: seriesName or seriesYear are null."
    );
    return Promise.resolve(null);
  }

  try {
    logger.debug(`Inserting series ${seriesName} into comic_series table.`);
    insertSeriesResult = await insertComicSeriesIntoDb({
      seriesName,
      seriesYear,
    });
  } catch (err) {
    logger.error("Error inserting series:", err);
  }

  if (insertSeriesResult?.success && insertSeriesResult.comicSeriesId) {
    seriesId = insertSeriesResult.comicSeriesId;
    logger.debug(
      `Inserted series ${seriesName} into comic_series table, with the id ${seriesId}`
    );
  }

  if (!seriesId) {
    return Promise.resolve(null);
  }

  return Promise.resolve(Number.parseInt(seriesId));
};

/**
 * Service function to check if the comic series folder mapping already exists in the database.
 * @param {Number} seriesId - The id of the comic series.
 * @param {Number} folderId - The id of the comic folder.
 * @returns {Bool} - A boolean indicating if the mapping exists in the database.
 */
const checkIfComicSeriesFolderMappingExistsInDatabase = async (
  seriesId,
  folderId
) => {
  let comicSeriesFolderMappingId = null;
  let findMappingResult = null;

  try {
    findMappingResult = await findMappingInComicSeriesFolders({
      seriesId,
      folderId,
    });

    comicSeriesFolderMappingId = findMappingResult?.id;
  } catch (err) {
    logger.error("Error finding mapping in comic series folders:", err);
  }

  if (comicSeriesFolderMappingId) {
    logger.debug(
      `Mapping for series_id ${seriesId} and folder_id ${folderId} already exists in the database.`
    );
    return true;
  }

  return false;
};

/**
 * Service function to insert the comic book series folder mapping into the database.
 * @param {Number} seriesId - The id of the comic series.
 * @param {Number} folderId - The id of the comic folder.
 * @returns {Promise(Number)} - The id of the comic series folder mapping in the database.
 * @returns {Promise(null)} - If the comic series folder mapping already exists in the database.
 */
const insertComicSeriesFolderMappingIntoDb = async (seriesId, folderId) => {
  let insertMappingResult = null;
  let comicSeriesFolderMappingId = null;

  try {
    insertMappingResult = await insertMappingIntoComicSeriesFolders({
      seriesId,
      folderId,
    });
  } catch (err) {
    logger.error("Error inserting mapping:", err);
  }

  if (insertMappingResult?.success) {
    comicSeriesFolderMappingId = insertMappingResult.mappingId;
    logger.debug(
      `Inserted mapping for series_id ${seriesId} and folder_id ${folderId} into comic_series_folders table.`
    );
  }

  if (!comicSeriesFolderMappingId) {
    return Promise.resolve(null);
  }

  return Promise.resolve(parseInt(comicSeriesFolderMappingId));
};

/**
 * Main function to add comic book files to the database.
 * @returns {Object} - An object containing the total number of files, total number of files added, total number of files skipped, total number of files failed, total number of folders added, total number of series added, and total number of mappings added.
 * @throws {Error} - An error if the DATA_DIR environment variable is not set.
 * @throws {Error} - An error if there is an issue inserting the comic book into the database.
 * @throws {Error} - An error if there is an issue finding the series id from the series name in the database.
 */
export const addFilesToDatabase = async () => {
  ensureDataDirIsInPlace();

  const filesList = getTheComicBookFilesInOurDataDir();

  let serviceLogObject = {
    totalFiles: filesList.length,
    totalFilesAdded: 0,
    totalFilesSkipped: 0,
    totalFilesFailed: 0,
    totalFoldersAdded: 0,
    totalSeriesAdded: 0,
    totalMappingsAdded: 0,
  };

  for (const filePath of filesList) {
    /*
    ********************************************************************************************************************
    Adding the comic book file to the database. comic_book_files table.
    ********************************************************************************************************************
    */

    // We will need to keep track of the comic book id for future database inserts.
    let comicBookId = null;

    try {
      const comicFileProperties =
        gatherInitialComicBookFileProperties(filePath);

      // Check if the comic book file already exists in the database.
      let checkIfComicBookExistsResult =
        await checkIfCurrentComicBookExistsInDatabase(
          comicFileProperties.fileHash
        );

      if (checkIfComicBookExistsResult.comicBookExists) {
        logger.debug(
          `Comic book file ${comicFileProperties.fileName} already exists in the database.`
        );
        serviceLogObject.totalFilesSkipped += 1;
        continue;
      }

      comicBookId = await addTheComicBookFileToDatabase(comicFileProperties);
    } catch (err) {
      logger.error("Error adding comic book file to database:", err);
      serviceLogObject.totalFilesFailed += 1;
      // If the comic book file insertion failed, continue to the next file.
      continue;
    }

    if (!comicBookId) {
      logger.error(
        "Error adding comic book file to database: comicBookId is null"
      );
      continue;
    }

    serviceLogObject.totalFilesAdded += 1;

    /*
    ********************************************************************************************************************
    Determine if the comic book file has a comic info xml file.

    This detemines what data can be extracted from the comic book file and added to the database.
    Without the comic info xml file, the comic book file name will be parsed to extract the comic book series name, year, and issue number, but the data will be incomplete.
    ********************************************************************************************************************
    */
    // We need to determine if the comic book file has a comic info xml using the file path determined earlier.
    let comicFileXmlData = await getComicBookComicInfoXmlData(filePath);

    /*
    ********************************************************************************************************************
    Adding the comic book metadata to the database. comic_book_metadata table.
    ********************************************************************************************************************
    */

    let comicBookMetadataId = null;
    if (comicFileXmlData) {
      comicBookMetadataId = await addComicBookMetadataToDatabase(
        comicBookId,
        comicFileXmlData
      );
    }

    /*
    ********************************************************************************************************************
    Adding the comic book roles to the database. comic_book_roles table.
    ********************************************************************************************************************
    */

    let comicBookRolesIds = null;
    if (comicFileXmlData) {
      comicBookRolesIds = await addComicBookRolesToDatabase(comicFileXmlData);
    }

    /*
    ********************************************************************************************************************
    Adding the comic book metadata roles to the database. comic_book_metadata_roles table.
    ********************************************************************************************************************
    */

    if (comicBookMetadataId && comicBookRolesIds) {
      await addComicBookMetadataRolesToDatabase(
        comicBookMetadataId,
        comicBookRolesIds
      );
    }

    /*
    ********************************************************************************************************************
    Adding the comic book folder to the database. comic_folder table.
    We will need to keep track of the comic folder to maintain the unique relationship between comic series and comic folders.

    NOTE: At the moment the approach for having one folder for volumes/tpbs and one folder for issues is to just injest them as 
    seperate series for not, and in a later step we can parse the folder tree structure and determine the relationship between the
    volumes/tpbs and the issues.
    ********************************************************************************************************************
    */

    let comicFolderId = null;
    // Check if the comic folder already exists in the database.
    const doesComicFolderExist = await checkIfComicFolderExistsInDatabase(
      filePath
    );

    if (!doesComicFolderExist) {
      comicFolderId = await addComicFolderToDatabase(filePath);
    }

    if (comicFolderId) {
      serviceLogObject.totalFoldersAdded += 1;
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series to the database. comic_series table.

    NOTE: IF we only have a non null comicFolderId, we assume 
    the folder is new and needs the series is also new.
    ********************************************************************************************************************
    */

    let comicSeriesId = null;
    const folderPath = getParentFolderFromFilePath(filePath);
    const seriesYear = parseComicFolderNameForYear(folderPath).seriesYear;

    // TODO: we need to check if the series already exists in the database.
    let doesComicSeriesExist = false;

    if (
      comicFileXmlData &&
      comicFileXmlData.seriesName &&
      comicFileXmlData.seriesName[0] &&
      comicFileXmlData.seriesName[0].length > 0
    ) {
      doesComicSeriesExist = await checkIfComicSeriesExistsInDatabase(
        seriesYear,
        comicFileXmlData.seriesName[0]
      );
    } else {
      const seriesName = parseComicFolderNameForName(folderPath);
      doesComicSeriesExist = await checkIfComicSeriesExistsInDatabase(
        seriesYear,
        seriesName
      );
    }

    if (!doesComicSeriesExist) {
      /*
        We want to check if we have metadata from the comicinfo.xml file.
        We also want to ensure it has a valid seriesName as in not null.
        We also want to check if the seriesName is not an empty string.

        If any of the above conditions are not met then we will parse the folder name for the series name.
      */
      if (
        comicFileXmlData &&
        comicFileXmlData.seriesName &&
        comicFileXmlData.seriesName[0] &&
        comicFileXmlData.seriesName[0].length > 0
      ) {
        comicSeriesId = await addSeriesToDatabase(
          seriesYear,
          comicFileXmlData.seriesName[0]
        );
      } else {
        const seriesName = parseComicFolderNameForName(folderPath);
        comicSeriesId = await addSeriesToDatabase(seriesYear, seriesName);
      }

      if (comicSeriesId) {
        serviceLogObject.totalSeriesAdded += 1;
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series folder mapping to the database. comic_series_folders table.

    TODO: We need to check if we need to keep track of the mapping id for future database inserts.
    ********************************************************************************************************************
    */

    // Check if the mapping already exists in the database.
    const doesComicSeriesFolderMappingExist =
      await checkIfComicSeriesFolderMappingExistsInDatabase(
        comicSeriesId,
        comicFolderId
      );

    if (!doesComicSeriesFolderMappingExist && comicSeriesId && comicFolderId) {
      const mappingId = await insertComicSeriesFolderMappingIntoDb(
        comicSeriesId,
        comicFolderId
      );

      if (mappingId) {
        serviceLogObject.totalMappingsAdded += 1;
      }
    }
  }

  logger.info("Ingestion process complete.");
  console.log(serviceLogObject);
  return serviceLogObject;
};
