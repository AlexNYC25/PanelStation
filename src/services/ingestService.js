import _ from "lodash";

import { logger } from "../utilities/logger.js";
import { getfileNameAndParentDirFromPath } from "../utilities/fileTools.js";
import { readFilesRecursively } from "../utilities/comicBookDataDirectory.js";
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
import {
  hasComicInfoXml,
  extractComicInfoXml,
} from "../utilities/comicFileParser.js";

import { insertComicFolderIntoDb } from "../models/comicFolder.js";
import { insertComicSeriesIntoDb } from "../models/comicSeries.js";
import { insertComicBookIntoDb } from "../models/comicBook.js";
import { insertMappingIntoComicSeriesFolders } from "../models/comicSeriesFolders.js";
import { insertComicBookSeriesMappingIntoDb } from "../models/comicBookSeriesMapping.js";
import { insertComicBookMetadataIntoDb } from "../models/comicBookMetadata.js";
import { insertComicBookRolesIntoDb } from "../models/comicBookRoles.js";
import { insertComicBookMetadataRolesIntoDb } from "../models/comicBookMetadataRoles.js";
import { insertComicPublisherIntoDb } from "../models/comicPublisher.js";
import { insertComicFormatToDatabase } from "../models/comicFormat.js";
import { getComicLanguageIdFromCode } from "../models/comicLanguage.js";
import { getComicMangaSettingsId } from "../models/comicMangaSettings.js";
import { insertComicImprintIntoDB } from "../models/comicImprint.js";
import { insertComicSeriesGroup } from "../models/comicSeriesGroup.js";
import { insertComicBookMetadataSeriesGroupMappingIntoDb } from "../models/comicBookMetadataSeriesGroupMapping.js";
import { insertComicGenreIntoDb } from "../models/comicGenre.js";
import { insertComicBookMetadataGenreMappingIntoDb } from "../models/comicBookMetadataGenreMapping.js";
import { insertComicCharacterIntoDb } from "../models/comicCharacters.js";
import { insertComicBookMetadataCharacterMappingIntoDb } from "../models/comicBookMetadataCharacterMapping.js";
import { insertComicTeamIntoDb } from "../models/comicTeams.js";
import { insertComicBookMetadataTeamMappingIntoDb } from "../models/comicBookMetadataTeamMapping.js";
import { insertComicLocationIntoDb } from "../models/comicLocations.js";
import { insertComicBookMetadataLocationMappingIntoDb } from "../models/comicBookMetadataLocationMapping.js";
import { insertComicSeriesStoryArc } from "../models/comicSeriesStoryArc.js";
import { insertComicBookMetadataStoryArcMappingIntoDB } from "../models/comicBookMetadataStoryArcMapping.js";

/**
 * Checks if the DATA_DIR environment variable is set.
 * @returns {void}
 * @throws {error} - An error if the DATA_DIR environment variable is not set.
 */
const ensureDataDirIsInPlace = () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }
};

/**
 * Gets all the files in the data directory.
 * @returns {string[]} - An array of file paths.
 * @throws {error} - An error if there is an issue reading the files in the data directory.
 * @throws {error} - An error if no files are found in the data directory.
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

/**
 * Service function to get the comic book files in the data directory.
 * @returns {string[]} - An array of comic book file paths.
 */
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
 * Gathers the initial properties of a comic book file.
 * @param {string} filePath - The file path of the comic book file.
 * @returns {{fileName: string, parentDir: string, fileHash: string}} - An object containing the file name, parent directory, and file hash.
 * @throws {error} If there is an issue extracting the file name or parent directory from the file path.
 * @throws {error} If there is an issue generating the file hash.
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

/**
 * Gets the parent folder from a file path.
 * @param {string} filePath
 * @returns {string} - The parent directory of the file.
 */
const getParentFolderFromFilePath = (filePath) => {
  const { parentDir } = getfileNameAndParentDirFromPath(filePath);
  return parentDir;
};

/**
 * Adds the comic book file to the database.
 * @param {{fileName: String, fileHash: String, filePath: String}} fileInfo - An object containing the file name, parent directory, and file hash.
 * @returns {Promise<number>} - A promise that resolves to the comic book id as an integer.
 * @throws {error} - An error if there is an issue inserting the comic book into the database.
 * @throws {error} - An error if the comic book id is not an integer.
 * @throws {error} - An error if the comic book id is null.
 */
const addTheComicBookFileToDatabase = async (fileInfo) => {
  try {
    const insertComicBookResult = await insertComicBookIntoDb(fileInfo);

    // Ensure the result is valid and is an integer
    const comicBookId = Number.parseInt(insertComicBookResult, 10);
    if (!Number.isInteger(comicBookId)) {
      throw new Error(
        `Returned comic book ID is not an integer: ${insertComicBookResult}`
      );
    }

    return comicBookId;
  } catch (err) {
    logger.error(`Error inserting comic book at ${fileInfo.filePath}:`, err);
    throw new Error(`Failed to insert comic book at ${fileInfo.filePath}`);
  }
};

/**
 * Gets and parses the comic book comic info xml data if it exists.
 * @param {string} filePath - The file path of the comic book file.
 * @returns {Promise<object|null>} - An object containing the comic book xml metadata.
 * @returns {null} - If the comic book does not have a comic info xml file.
 * @throws {error} - An error if there is an issue parsing the comic info xml.
 * @throws {error} - An error if there is an issue converting the comic info xml text to json.
 * @throws {error} - An error if there is an issue extracting the comic info xml from the comic book file.
 */
const getComicBookComicInfoXmlData = async (filePath) => {
  if (!hasComicInfoXml(filePath)) {
    return null;
  }

  try {
    // Read, convert, and parse the XML data in sequence
    const rawComicInfoXml = extractComicInfoXml(filePath);
    const jsonComicInfoXml = await convertComicInfoXmlTextToJson(
      rawComicInfoXml
    );
    return await parseComicInfoXmlForMetadata(jsonComicInfoXml);
  } catch (err) {
    logger.error(`Error parsing comic info XML for file: ${filePath}`, err);
    return null;
  }
};

/**
 * Adds the comic book metadata to the database.
 * @param {number} comicBookId - The id of the comic book in the database.
 * @param {object} comicFileXmlData - The comic book metadata.
 * @returns {Promise<number|null>} - A promise that resolves to the result of the database insert.
 */
const addComicBookMetadataToDatabase = async (
  comicBookId,
  comicFileXmlData
) => {
  try {
    const insertMetadataResult = await insertComicBookMetadataIntoDb({
      comicBookId,
      ...comicFileXmlData,
    });

    if (insertMetadataResult?.success) {
      logger.debug(
        `Inserted metadata for comic book ${comicBookId} into comic_book_metadata table.`
      );
    }

    return insertMetadataResult?.id || null;
  } catch (err) {
    logger.error(
      `Error inserting metadata for comic book ${comicBookId}:`,
      err
    );
    return null;
  }
};

/**
 * Adds comic book roles (e.g., writer, penciller) to the database.
 * @param {object} comicFileXmlData - The comic book metadata.
 * @returns {Promise<number[]>} - A promise that resolves to an array of comic book role IDs.
 */
const addComicBookRolesToDatabase = async (comicFileXmlData) => {
  if (!comicFileXmlData) return [];

  const rolesToProcess = [
    { key: "writer", dbKey: "writer" },
    { key: "penciller", dbKey: "penciller" },
    { key: "inker", dbKey: "inker" },
    { key: "colorist", dbKey: "colorist" },
    { key: "letterer", dbKey: "letterer" },
    { key: "coverArtist", dbKey: "cover_artist" },
    { key: "editor", dbKey: "editor" },
  ];

  const rolesIds = [];

  for (const { key, dbKey } of rolesToProcess) {
    const roleData = comicFileXmlData[key];

    if (roleData) {
      const roleNames = roleData.split(",").map((name) => name.trim());

      for (const roleName of roleNames) {
        try {
          const insertionResult = await insertComicBookRolesIntoDb({
            [dbKey]: roleName,
          });

          if (insertionResult?.success) {
            rolesIds.push(insertionResult.comicBookRolesId);
          }
        } catch (err) {
          logger.error(`Error processing ${dbKey}: ${roleName}`, err);
        }
      }
    }
  }

  return rolesIds;
};

/**
 * Adds the relationship between a comic book's metadata and its roles to the database.
 * @param {number} metadataId - The ID of the comic book metadata in the database.
 * @param {number[]} rolesIds - An array of the comic book role IDs in the database.
 * @returns {Promise<number[]>} - A promise that resolves to an array of metadata role IDs.
 */
const addComicBookMetadataRolesToDatabase = async (metadataId, rolesIds) => {
  const metadataRolesIds = [];

  for (const roleId of rolesIds) {
    try {
      const insertMetadataRolesResult =
        await insertComicBookMetadataRolesIntoDb({
          metadataId,
          roleId,
        });

      if (insertMetadataRolesResult?.success) {
        logger.debug(
          `Inserted metadata role for metadata ID ${metadataId} and role ID ${roleId} into comic_book_metadata_roles table.`
        );
        metadataRolesIds.push(insertMetadataRolesResult.id);
      }
    } catch (err) {
      logger.error(
        `Error inserting metadata role for metadata ID ${metadataId} and role ID ${roleId}:`,
        err
      );
    }
  }

  return metadataRolesIds;
};

/**
 * Adds the comic publisher to the database.
 * @param {string} publisherName - The name of the comic publisher.
 * @returns {Promise<number|null>} - The ID of the comic publisher in the database, or null if unsuccessful.
 */
const addComicPublisherToDatabase = async (publisherName) => {
  try {
    const insertPublisherResult = await insertComicPublisherIntoDb(
      publisherName
    );

    if (insertPublisherResult) {
      const publisherId = Number.parseInt(
        insertPublisherResult,
        10
      );
      logger.debug(
        `Inserted publisher "${publisherName}" into comic_publisher table with ID: ${publisherId}`
      );
      return publisherId;
    }
  } catch (err) {
    logger.error(`Error inserting publisher "${publisherName}":`, err);
  }

  return null;
};

const addComicImprintToDatabase = async (imprintName) => {
  try {
    const insertImprintResult = await insertComicImprintIntoDB(imprintName);

    if (insertImprintResult) {
      const imprintId = Number.parseInt(insertImprintResult, 10);
      logger.debug(
        `Inserted imprint "${imprintName}" into comic_imprint table with ID: ${imprintId}`
      );
      return imprintId;
    }
  } catch (err) {
    logger.error(`Error inserting imprint "${imprintName}":`, err);
  }

  return null;
};

const addComicFormatToDatabase = async (formatName) => {
  try {
    const insertFormatResult = await insertComicFormatToDatabase(formatName);

    if (insertFormatResult) {
      logger.debug(
        `Inserted format "${formatName}" into comic_format table.`
      );
    }

    return insertFormatResult;
  } catch (err) {
    logger.error(`Error inserting format "${formatName}":`, err);
  }
}

const lookupComicLanguageToDatabase = async (languageCode) => {
  try {
    const languageId = await getComicLanguageIdFromCode(languageCode);
    return languageId;
  } catch (err) {
    logger.error(`Error looking up language "${languageCode}":`, err);
  }
};

const lookupComicMangaSettingsToDatabase = async (mangaSetting) => {
  try {
    const mangaSettingId = await getComicMangaSettingsId(mangaSetting);
    return mangaSettingId;
  } catch (err) {
    logger.error(`Error looking up manga setting "${mangaSetting}":`, err);
  }
}

/**
 * Adds a comic folder to the database.
 * @param {string} comicFilePath - The file path of the comic.
 * @returns {Promise<number|null>} - The ID of the comic folder in the database, or null if the folder already exists.
 */
const addComicFolderToDatabase = async (comicFilePath) => {
  const comicFolderDir = getParentFolderFromFilePath(comicFilePath);
  const folderHash = generateFolderHash(comicFolderDir);

  try {
    const insertFolderResult = await insertComicFolderIntoDb({
      folderPath: comicFolderDir,
      folderHash,
    });

    if (insertFolderResult?.success) {
      const comicFolderId = insertFolderResult.comicFolderId;

      if (comicFolderId) {
        logger.debug(
          `Inserted folder "${comicFolderDir}" into comic_folder table with ID: ${comicFolderId}`
        );
      } else {
        logger.debug(
          `Folder "${comicFolderDir}" already exists in the database.`
        );
      }

      return comicFolderId;
    }
  } catch (err) {
    logger.error(`Error inserting folder "${comicFolderDir}":`, err);
  }

  return null;
};

/**
 * Adds a comic book series to the database.
 * @param {string} seriesYear - The year of the comic book series.
 * @param {string} seriesName - The name of the comic book series.
 * @returns {Promise<number|null>} - The ID of the comic series in the database, or null if unsuccessful.
 */
const addSeriesToDatabase = async (seriesYear, seriesName) => {
  if (!seriesName || !seriesYear) {
    logger.error("Error adding series: seriesName or seriesYear is missing.");
    return null;
  }

  try {
    const { success, comicSeriesId } = await insertComicSeriesIntoDb({
      seriesName,
      seriesYear,
    });

    if (success && comicSeriesId) {
      logger.debug(
        `Series "${seriesName}" (Year: ${seriesYear}) added/retrieved with ID: ${comicSeriesId}.`
      );
      return comicSeriesId;
    }
  } catch (err) {
    logger.error(
      `Error adding series "${seriesName}" (Year: ${seriesYear}):`,
      err
    );
  }

  return null;
};

/**
 * Inserts a comic book series folder mapping into the database.
 * @param {number} seriesId - The ID of the comic series.
 * @param {number} folderId - The ID of the comic folder.
 * @returns {Promise<number|null>} - The ID of the comic series folder mapping in the database, or null if it already exists.
 */
const insertComicSeriesFolderMappingIntoDb = async (seriesId, folderId) => {
  try {
    const insertMappingResult = await insertMappingIntoComicSeriesFolders({
      seriesId,
      folderId,
    });

    if (insertMappingResult?.success) {
      const mappingId = parseInt(insertMappingResult.mappingId, 10);
      logger.debug(
        `Inserted mapping for series_id ${seriesId} and folder_id ${folderId} into comic_series_folders table with ID: ${mappingId}.`
      );
      return mappingId;
    }
  } catch (err) {
    logger.error(
      `Error inserting mapping for series_id ${seriesId} and folder_id ${folderId}:`,
      err
    );
  }

  return null;
};

/**
 * Main function to add comic book files to the database.
 * @returns {object} - An object containing the total number of files, total number of files added, total number of files skipped, total number of files failed, total number of folders added, total number of series added, and total number of mappings added.
 * @throws {error} - An error if the DATA_DIR environment variable is not set.
 * @throws {error} - An error if there is an issue inserting the comic book into the database.
 * @throws {error} - An error if there is an issue finding the series id from the series name in the database.
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

    const comicFileProperties = gatherInitialComicBookFileProperties(filePath);

    // We will need to keep track of the comic book id for future database inserts.
    const comicBookId = await addTheComicBookFileToDatabase(
      comicFileProperties
    );

    if (!comicBookId) {
      serviceLogObject.totalFilesFailed += 1;
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
    Adding the comic publisher to the database. comic_publisher table.
    ********************************************************************************************************************
    */

    let comicPublisherId = null;
    if (comicFileXmlData && comicFileXmlData.publisher) {
      comicPublisherId = await addComicPublisherToDatabase(
        comicFileXmlData.publisher
      );
    }

    /*
    ********************************************************************************************************************
    Adding the comic imprint to the database. comic_imprint table.
    ********************************************************************************************************************
    */

    let comicImprintId = null;
    if (comicFileXmlData && comicFileXmlData.imprint) {
      comicImprintId = await addComicImprintToDatabase(comicFileXmlData.imprint);
    }

    /*
    ********************************************************************************************************************
    Adding the comic book format id to the comic_format table.
    ********************************************************************************************************************
    */

    let comicFormatId = null;
    if (comicFileXmlData && comicFileXmlData.format) {
      comicFormatId = await addComicFormatToDatabase(comicFileXmlData.format);
    }

    /*
    ********************************************************************************************************************
    Find the comic language id from the comic_language table.
    ********************************************************************************************************************
    */

    let comicLanguageId = null;
    if (comicFileXmlData && comicFileXmlData.language) {
      comicLanguageId = await lookupComicLanguageToDatabase(comicFileXmlData.language);
    }
  
    /*
    ********************************************************************************************************************
    Find the comic manga settings id from the comic_manga_settings table.
    ********************************************************************************************************************
    */

    let comicMangaSettingsId = null;
    if (comicFileXmlData && comicFileXmlData.manga) {
      comicMangaSettingsId = await lookupComicMangaSettingsToDatabase(comicFileXmlData.manga);
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series group(s) to the database if they exist, comic_series_group table.
    ********************************************************************************************************************
    */

    let comicSeriesGroups = [];

    if (comicFileXmlData && comicFileXmlData.seriesGroup) {
      let parsedComicSeriesGroups = comicFileXmlData.seriesGroup.split(",").map((group) => group.trim());

      for (const group of parsedComicSeriesGroups) {
        const seriesGroupId = await insertComicSeriesGroup(group);

        if (seriesGroupId) {
          comicSeriesGroups.push(seriesGroupId);
        }
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series group(s) mapping to the database, comic_book_metadata_series_group_mapping table.
    ********************************************************************************************************************
    */

    if (comicBookMetadataId && comicSeriesGroups.length > 0) {
      for (const seriesGroupId of comicSeriesGroups) {
        await insertComicBookMetadataSeriesGroupMappingIntoDb(
          comicBookMetadataId,
          seriesGroupId
        );
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book genre(s) to the database if they exist, comic_genre table.
    ********************************************************************************************************************
    */

    let comicGenres = [];

    if (comicFileXmlData && comicFileXmlData.genre && comicFileXmlData.genre.length > 0) {
      let parsedComicGenres = comicFileXmlData.genre.split(",").map((genre) => genre.trim());

      for (const genre of parsedComicGenres) {
        const genreId = await insertComicGenreIntoDb(genre);

        if (genreId) {
          comicGenres.push(genreId);
        }
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book genre(s) mapping to the database, comic_book_metadata_genre_mapping table.
    ********************************************************************************************************************
    */

    if (comicBookMetadataId && comicGenres.length > 0) {
      for (const genreId of comicGenres) {
        await insertComicBookMetadataGenreMappingIntoDb(
          comicBookMetadataId,
          genreId
        );
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book character(s) to the database if they exist, comic_characters table.
    ********************************************************************************************************************
    */

    let comicCharacters = [];
    if(comicFileXmlData && comicFileXmlData.characters) {
      const characters = comicFileXmlData.characters.split(",").map((character) => character.trim());

      for (const character of characters) {
        let comicCharacterId = await insertComicCharacterIntoDb(character);

        if (comicCharacterId) {
          comicCharacters.push(comicCharacterId);
        }
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book character(s) mapping to the database, comic_book_metadata_character_mapping table.
    ********************************************************************************************************************
    */

    if (comicBookMetadataId && comicCharacters.length > 0) {
      for (const characterId of comicCharacters) {
        await insertComicBookMetadataCharacterMappingIntoDb(
          comicBookMetadataId,
          characterId
        );
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book team(s) to the database if they exist, comic_teams table.
    ********************************************************************************************************************
    */

    let comicTeams = [];
    if (comicFileXmlData && comicFileXmlData.teams) {
      const teams = comicFileXmlData.teams.split(",").map((team) => team.trim());

      for (const team of teams) {
        let comicTeamId = await insertComicTeamIntoDb(team);

        if (comicTeamId) {
          comicTeams.push(comicTeamId);
        }
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book team(s) mapping to the database, comic_book_metadata_team_mapping table.
    ********************************************************************************************************************
    */

    if (comicBookMetadataId && comicTeams.length > 0) {
      for (const teamId of comicTeams) {
        await insertComicBookMetadataTeamMappingIntoDb(
          comicBookMetadataId,
          teamId
        );
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book location(s) to the database if they exist, comic_locations table.
    ********************************************************************************************************************
    */

    let comicLocations = [];
    if (comicFileXmlData && comicFileXmlData.locations) {
      const locations = comicFileXmlData.locations.split(",").map((location) => location.trim());

      for (const location of locations) {
        let comicLocationId = await insertComicLocationIntoDb(location);

        if (comicLocationId) {
          comicLocations.push(comicLocationId);
        }
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book locations(s) mapping to the database, comic_book_metadata_location_mapping table.
    ********************************************************************************************************************
    */
    
    if (comicBookMetadataId && comicLocations.length > 0) {
      for (const locationId of comicLocations) {
        await insertComicBookMetadataLocationMappingIntoDb(
          comicBookMetadataId,
          locationId
        );
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series story arc(s) to the database if they exist, comic_series_story_arc table.
    ********************************************************************************************************************
    */

    let comicSeriesStoryArcs = [];

    if (comicFileXmlData && comicFileXmlData.storyArc) {
      const storyArcs = comicFileXmlData.storyArc.split(",").map((storyArc) => storyArc.trim());

      for (const storyArc of storyArcs) {
        let comicSeriesStoryArcId = await insertComicSeriesStoryArc(storyArc);

        if (comicSeriesStoryArcId) {
          comicSeriesStoryArcs.push(comicSeriesStoryArcId);
        }
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series story arc(s) mapping to the database, comic_book_metadata_story_arc_mapping table.
    ********************************************************************************************************************
    */

    if (comicBookMetadataId && comicSeriesStoryArcs.length > 0) {
      for (const storyArcId of comicSeriesStoryArcs) {
        await insertComicBookMetadataStoryArcMappingIntoDB(
          comicBookMetadataId,
          storyArcId
        );
      }
    }

    /*
    ********************************************************************************************************************
    Update the comic book metadata with the new metadata properties, related to other tables.
    ********************************************************************************************************************
    */

    const metadataUpdates = {};

    if (comicFileXmlData && comicFileXmlData.language && comicLanguageId) {
      metadataUpdates.languageId = comicLanguageId;
    }

    if (comicFileXmlData && comicFileXmlData.publisher && comicPublisherId) {
      metadataUpdates.publisherId = comicPublisherId;
    }

    if (comicFileXmlData && comicFileXmlData.imprint && comicImprintId) {
      metadataUpdates.comicImprintId = comicImprintId;
    }

    if (comicFileXmlData && comicFileXmlData.format && comicFormatId) {
      metadataUpdates.formatId = comicFormatId;
    }

    if (comicFileXmlData && comicFileXmlData.manga && comicMangaSettingsId) {
      metadataUpdates.mangaSettingsId = comicMangaSettingsId;
    }

    if (comicFileXmlData && comicFileXmlData.imprint && comicImprintId) {
      metadataUpdates.comicImprintId = comicImprintId;
    }

    if (Object.keys(metadataUpdates).length > 0 && comicBookMetadataId) {
      await addComicBookMetadataToDatabase(comicBookId, {
      ...comicFileXmlData,
      ...metadataUpdates,
      });
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

    let comicFolderId = await addComicFolderToDatabase(filePath);

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

    const folderPath = getParentFolderFromFilePath(filePath);
    const seriesYear = parseComicFolderNameForYear(folderPath).seriesYear;
    let seriesName = null;

    if (comicFileXmlData && comicFileXmlData.seriesName) {
      seriesName = comicFileXmlData.seriesName;
    } else {
      seriesName = parseComicFolderNameForName(folderPath);
    }

    const comicSeriesId = await addSeriesToDatabase(seriesYear, seriesName);

    if (!comicSeriesId) {
      throw new Error("Failed to retrieve or insert comic series.");
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series folder mapping to the database. comic_series_folders table.

    TODO: We need to check if we need to keep track of the mapping id for future database inserts.
    ********************************************************************************************************************
    */

    if (comicSeriesId && comicFolderId) {
      const mappingId = await insertComicSeriesFolderMappingIntoDb(
        comicSeriesId,
        comicFolderId
      );

      if (mappingId) {
        serviceLogObject.totalMappingsAdded += 1;
      }
    }

    /*
    ********************************************************************************************************************
    Adding the comic book series mapping to the database. comic_book_series_mapping table.
    ********************************************************************************************************************
    */

    if (comicSeriesId || comicBookId) {
      await insertComicBookSeriesMappingIntoDb({
        comicBookId: comicBookId,
        seriesId: comicSeriesId,
      });
    }
  }

  logger.info("Ingestion process complete.");
  return serviceLogObject;
};
