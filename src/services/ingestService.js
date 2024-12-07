import path from "path";

import {
  generateFolderHash,
  generateFileHash,
} from "../utilities/hashTools.js";
import {
  convertComicInfoXmlTextToJson,
  parseAndPrintOutComicInfoXml,
  parseComicInfoXmlForMetadata,
  parseComicInfoXmlForRoles,
} from "../utilities/xmlTools.js";
import { parseComicFolderName } from "../utilities/comicFolderParser.js";
import { readFilesRecursively } from "../utilities/comicBookDataDirectory.js";
import {
  hasComicInfoXml,
  extractComicInfoXml,
  parseComicFileName,
} from "../utilities/comicFileParser.js";
import { insertComicFolderIntoDb } from "../models/comicFolder.js";
import {
  insertComicSeriesIntoDb,
  findSeriesIdFromSeriesNameInDb,
} from "../models/comicSeries.js";
import { insertComicBookIntoDb } from "../models/comicBook.js";
import { insertMappingIntoComicSeriesFolders } from "../models/comicSeriesFolders.js";
import { insertComicBookSeriesMappingIntoDb } from "../models/comicBookSeriesMapping.js";
import { insertComicBookMetadataIntoDb } from "../models/comicBookMetadata.js";
import { insertComicBookRolesIntoDb } from "../models/comicBookRoles.js";
import { insertComicBookMetadataRolesIntoDb } from "../models/comicBookMetadataRoles.js";

export const addFoldersToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const directories = readFilesRecursively(dataDir).directories;

  for (const dir of directories) {
    const folderHash = generateFolderHash(dir);

    let comicFolderId = null;
    let insertFolderResult = null;

    try {
      insertFolderResult = await insertComicFolderIntoDb({
        folderPath: dir,
        folderHash,
      });
    } catch (err) {
      console.error("Error inserting folder:", err);
    }

    if (insertFolderResult?.success) {
      comicFolderId = insertFolderResult.comicFolderId;
      if (!comicFolderId) {
        console.log(`Folder ${dir} already exists in the database.`);
      } else {
        console.log(
          `Inserted folder ${dir} into comic_folder table, with the id ${comicFolderId}`
        );
      }
    }

    if (!comicFolderId) {
      continue;
    }

    const parsedComicDetails = parseComicFolderName(dir);
    let comicSeriesId = null;
    let insertSeriesResult = null;

    try {
      insertSeriesResult = await insertComicSeriesIntoDb({
        seriesName: parsedComicDetails.series_name,
        seriesYear: parsedComicDetails.series_year,
      });
    } catch (err) {
      console.error("Error inserting series:", err);
    }

    if (insertSeriesResult.success) {
      comicSeriesId = insertSeriesResult.comicSeriesId;
      console.log(
        `Inserted series ${parsedComicDetails.series_name} into comic_series table, with the id ${comicSeriesId}`
      );
    }

    if (!comicSeriesId) {
      continue;
    }

    let insertMappingResult = null;

    try {
      insertMappingResult = await insertMappingIntoComicSeriesFolders({
        seriesId: comicSeriesId,
        folderId: comicFolderId,
      });
    } catch (err) {
      console.error("Error inserting mapping:", err);
    }

    if (insertMappingResult.success) {
      console.log(
        `Inserted mapping for series_id ${comicSeriesId} and folder_id ${comicFolderId} into comic_series_folders table.`
      );
    }
  }
};

export const addFilesToDatabase = async () => {
  const dataDir = process.env.DATA_DIR;
  if (!dataDir) {
    throw new Error("DATA_DIR environment variable is not set");
  }

  const filesList = readFilesRecursively(dataDir).files;

  for (const filePath of filesList) {
    /*
     * Extract the file name, hash, and parent directory from the file path.
     * Insert the comic book into the database table 'comic_book'.
     */
    const fileName = path.basename(filePath);
    const fileHash = generateFileHash(filePath);
    const parentDir = path.dirname(filePath);

    let comicBookId = null;
    let insertComicBookResult = null;

    try {
      insertComicBookResult = await insertComicBookIntoDb({
        fileName,
        filePath,
        fileHash,
      });
    } catch (err) {
      console.error("Error inserting comic book:", err);
    }

    if (insertComicBookResult?.success) {
      comicBookId = insertComicBookResult.comicBookId;
      if (!comicBookId) {
        console.log(`Comic book ${fileName} already exists in the database.`);
      } else {
        console.log(
          `Inserted file ${fileName} into comic_book table, with the id ${insertComicBookResult.comicBookId}`
        );
      }
    }

    if (!comicBookId) {
      continue;
    }

    /*
     * Extract the comic series details from the parent directory of the comic book.
     * Find the series id from the series name in the database table 'comic_series'.
     * Insert the mapping into the database table 'comic_series_folders'.
     */
    const parsedComicDetails = parseComicFolderName(parentDir);
    let seriesId = null;
    let findSeriesIdResult = null;

    try {
      findSeriesIdResult = await findSeriesIdFromSeriesNameInDb(
        parsedComicDetails.series_name
      );
    } catch (err) {
      console.error("Error finding series id:", err);
    }

    if (findSeriesIdResult.seriesId) {
      seriesId = findSeriesIdResult.seriesId;
      console.log(
        `Found series id ${seriesId} for series name ${parsedComicDetails.series_name}`
      );
    }

    if (!seriesId) {
      continue;
    }

    let insertMappingResult = null;

    try {
      insertMappingResult = await insertComicBookSeriesMappingIntoDb({
        comicBookId,
        seriesId,
      });
    } catch (err) {
      console.error("Error inserting mapping:", err);
    }

    if (insertMappingResult.success) {
      console.log(
        `Inserted mapping for series_id ${seriesId} and comic_book_id ${comicBookId} into comic_series_folders table.`
      );
    }

    /*
     * Check if the comic book has a comicinfo.xml file.
     * If it does parse the comicinfo.xml file and insert the details into the database table 'comic_book_metadata'.
     * else parse the comic book file name and insert the details into the database table 'comic_book_metadata'.
     */
    let hasComicInfoXmlResult = null;

    try {
      hasComicInfoXmlResult = hasComicInfoXml(filePath);
    } catch (err) {
      console.error("Error checking for comicinfo.xml:", err);
    }

    if (hasComicInfoXmlResult) {
      console.log(`Comic book ${fileName} has a comicinfo.xml file.`);
    } else {
      console.log(`Comic book ${fileName} does not have a comicinfo.xml file.`);
    }

    let comicInfoXml = null;

    if (hasComicInfoXmlResult) {
      try {
        comicInfoXml = extractComicInfoXml(filePath);
      } catch (err) {
        console.error("Error extracting comicinfo.xml:", err);
      }
    }

    let insertMetadataResult = null;
    let parsedComicInfo = null;

    if (comicInfoXml) {
      try {
        parsedComicInfo = await convertComicInfoXmlTextToJson(comicInfoXml);

        const parsedMetadata = await parseComicInfoXmlForMetadata(
          parsedComicInfo
        );
        parsedMetadata.comic_book_id = comicBookId;

        insertMetadataResult = await insertComicBookMetadataIntoDb(
          parsedMetadata
        );

        console.log(
          `Inserted metadata for comic book ${fileName} into comic_book_metadata table, with the id ${insertMetadataResult.id}`
        );
      } catch (err) {
        console.error("Error parsing comicinfo.xml:", err);
      }

      if (insertMetadataResult.success) {
        console.log(
          `Inserted metadata for comic book ${fileName} into comic_book_metadata table.`
        );
      }
    } else {
      const parsedComicFileName = parseComicFileName(fileName);

      try {
        insertMetadataResult = await insertComicBookMetadataIntoDb({
          comic_book_id: comicBookId,
          series_name: parsedComicFileName.series_name,
          title: parsedComicFileName.title,
          issue_number: parsedComicFileName.issue_number,
          publisher: null,
          publication_date: parsedComicFileName.series_year,
          summary: null,
          genre: null,
          page_count: null,
        });

        console.log(
          `Inserted metadata for comic book ${fileName} into comic_book_metadata table, with the id ${metadataId.id}`
        );
      } catch (err) {
        console.error("Error parsing comic file name:", err);
      }

      if (insertMetadataResult.success) {
        console.log(
          `Inserted metadata for comic book ${fileName} into comic_book_metadata table.`
        );
      }
    }

    /*
      * Check if the ParsedComicInfo object is not null and the metadata was inserted successfully.
      * Parse the comicinfo data for roles and insert the details into the database table 'comic_book_roles', keeping track of the role ids.
     */

    let roleIds = [];

    if (parsedComicInfo && insertMetadataResult.success) {
      try {
        let roleDataArr = await parseComicInfoXmlForRoles(parsedComicInfo);

        for (let roleData of roleDataArr) {
          roleData.comic_book_id = comicBookId;
          let insertResult = await insertComicBookRolesIntoDb(roleData);

          if (insertResult.success) {
            roleIds.push(insertResult.comicBookRolesId);
          }
        }
      } catch (err) {
        console.error("Error parsing and printing comicinfo.xml:", err);
      }
    }

    if (roleIds.length > 0) {
      console.log(
        `Inserted roles for comic book ${fileName} into comic_book_roles table.`
      );
    }

    /*
      * Check if we have role ids and the metadata was inserted successfully.
      * Create a metadata role pair object and insert the details into the database table 'comic_book_metadata_roles', keeping track of the role pair ids.
    */
    let rolePairIds = [];

    if (roleIds.length > 0 && insertMetadataResult.success) {
      for (let roleId of roleIds) {
        const metadataRolePair = {
          metadataId: insertMetadataResult.id,
          roleId,
        };

        try {
          let insertMetadataRoleResult =
            await insertComicBookMetadataRolesIntoDb(metadataRolePair);

          if (insertMetadataRoleResult.success) {
            rolePairIds.push(insertMetadataRoleResult.id);
          }
        } catch (err) {
          console.error("Error inserting metadata role:", err);
        }
      }
    }
  }
};
