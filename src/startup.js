import fs from "fs";

import { runQuery } from "./config/dbConnection.js";
import { checkAndCreateComicBookTable } from "./models/comicBook.js";
import { checkAndCreateComicFolderTable } from "./models/comicFolder.js";
import { checkAndCreateComicSeriesTable } from "./models/comicSeries.js";
import { checkAndCreateComicSeriesFoldersTable } from "./models/comicSeriesFolders.js";
import { checkAndCreateComicBookRolesTable } from "./models/comicBookRoles.js";
import { checkAndCreateComicBookMetadataTable } from "./models/comicBookMetadata.js";
import { checkAndCreateComicBookMetadataRolesTable } from "./models/comicBookMetadataRoles.js";
import { checkAndCreateComicBookSeriesMappingTable } from "./models/comicBookSeriesMapping.js";
import { checkAndCreateComicPublisherTable } from "./models/comicPublisher.js";
import { checkAndCreateComicImprintTable } from "./models/comicImprint.js";
import { checkAndCreateComicSeriesGroupTable } from "./models/comicSeriesGroup.js";
import { checkAndCreateComicBookMetadataSeriesGroupMappingTable } from "./models/comicBookMetadataSeriesGroupMapping.js";
import { checkAndCreateComicSeriesStoryArcTable } from "./models/comicSeriesStoryArc.js";
import { checkAndCreateComicCountryTable } from "./models/comicCountry.js";
import { checkAndCreateComicFormatTable } from "./models/comicFormat.js";
import { checkAndCreateComicLanguageTable } from "./models/comicLanguage.js";
import { checkAndCreateComicLocationsTable } from "./models/comicLocations.js";
import { checkAndCreateComicMangaSettingsTable } from "./models/comicMangaSettings.js";
import { checkAndCreateComicRatingsTable } from "./models/comicRatings.js";
import { checkAndCreateComicTagsTable } from "./models/comicTags.js";
import { checkAndCreateComicTeamsTable } from "./models/comicTeams.js";
import { checkAndCreateComicCharactersTable } from "./models/comicCharacters.js";
import { checkAndCreateComicGenreTable } from "./models/comicGenre.js";
import { checkAndCreateComicBookMetadataGenreMappingTable } from "./models/comicBookMetadataGenreMapping.js";
import { checkAndCreateComicBookMetadataCharacterMappingTable } from "./models/comicBookMetadataCharacterMapping.js";
import { checkAndCreateComicBookMetadataTeamMappingTable } from "./models/comicBookMetadataTeamMapping.js";
import { checkAndCreateComicBookMetadataLocationMappingTable } from "./models/comicBookMetadataLocationMapping.js";
import { checkAndCreateComicBookMetadataStoryArcMappingTable } from "./models/comicBookMetadataStoryArcMapping.js";

const checkComicBookDataDirectoryExists = () => {
  const dataDir = process.env.DATA_DIR;
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir);
      console.log(`Directory ${dataDir} created successfully.`);
    } catch (err) {
      console.error(`Error creating directory ${dataDir}:`, err);
    }
  } else {
    console.log(`Directory ${dataDir} already exists.`);
  }
};

const initializeDatabase = async () => {
  // comic_book_file
  await checkAndCreateComicBookTable();
  // comic_folder
  await checkAndCreateComicFolderTable();
  // comic_series
  await checkAndCreateComicSeriesTable();
  // comic_series_folders
  await checkAndCreateComicSeriesFoldersTable();
  // comic_book_roles
  await checkAndCreateComicBookRolesTable();
  /// comic_publisher
  await checkAndCreateComicPublisherTable();
  // comic_format
  await checkAndCreateComicFormatTable();
  // comic_language
  await checkAndCreateComicLanguageTable();
  // comic_imprint
  await checkAndCreateComicImprintTable();
  // comic_series_group
  await checkAndCreateComicSeriesGroupTable();
  // comic_genre
  await checkAndCreateComicGenreTable();
  // comic_manga_settings
  await checkAndCreateComicMangaSettingsTable();
  // comic_book_metadata
  await checkAndCreateComicBookMetadataTable();
  // comic_characters
  await checkAndCreateComicCharactersTable();
  // comic_country
  await checkAndCreateComicCountryTable();
  // comic_locations
  await checkAndCreateComicLocationsTable();
  // comic_ratings
  await checkAndCreateComicRatingsTable();
  // comic_series_story_arc
  await checkAndCreateComicSeriesStoryArcTable();
  // comic_tags
  await checkAndCreateComicTagsTable();
  // comic_teams
  await checkAndCreateComicTeamsTable();

  // comic_book_metadata_roles
  await checkAndCreateComicBookMetadataRolesTable();
  // comic_book_series_mapping
  await checkAndCreateComicBookSeriesMappingTable();
  // comic_book_metadata_series_group_mapping
  await checkAndCreateComicBookMetadataSeriesGroupMappingTable();
  // comic_book_metadata_genre_mapping
  await checkAndCreateComicBookMetadataGenreMappingTable();
  // comic_book_metadata_character_mapping
  await checkAndCreateComicBookMetadataCharacterMappingTable();
  // comic_book_metadata_team_mapping
  await checkAndCreateComicBookMetadataTeamMappingTable();
  // comic_book_metadata_location_mapping
  await checkAndCreateComicBookMetadataLocationMappingTable();
  // comic_book_metadata_story_arc_mapping
  await checkAndCreateComicBookMetadataStoryArcMappingTable();
};

export { checkComicBookDataDirectoryExists, initializeDatabase };
