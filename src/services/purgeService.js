import { deleteComicBookTable } from "../models/comicBook.js";
import { deleteComicBookMetadataTable } from "../models/comicBookMetadata.js";
import { deleteComicBookMetadataRolesTable } from "../models/comicBookMetadataRoles.js";
import { deleteComicBookRolesTable } from "../models/comicBookRoles.js";
import { deleteComicBookSeriesMappingTable } from "../models/comicBookSeriesMapping.js";
import { deleteComicFolderTable } from "../models/comicFolder.js";
import { deleteComicSeriesTable } from "../models/comicSeries.js";
import { deleteComicSeriesFoldersTable } from "../models/comicSeriesFolders.js";
import { deleteComicPublisherTable } from "../models/comicPublisher.js";
import { deleteComicImprintTable } from "../models/comicImprint.js";
import { deleteComicSeriesGroupTable } from "../models/comicSeriesGroup.js";
import { deleteComicBookMetadataSeriesGroupMappingTable } from "../models/comicBookMetadataSeriesGroupMapping.js";
import { deleteComicBookMetadataGenreMappingTable } from "../models/comicBookMetadataGenreMapping.js";
import { deleteComicSeriesStoryArcTable } from "../models/comicSeriesStoryArc.js";
import { deleteComicCharactersTable } from "../models/comicCharacters.js";
import { deleteComicCountryTable } from "../models/comicCountry.js";
import { deleteComicFormatTable } from "../models/comicFormat.js";
import { deleteComicGenreTable } from "../models/comicGenre.js";
import { deleteComicLanguageTable } from "../models/comicLanguage.js";
import { deleteComicLocationsTable } from "../models/comicLocations.js";
import { deleteComicMangaSettingsTable } from "../models/comicMangaSettings.js";
import { deleteComicRatingsTable } from "../models/comicRatings.js";
import { deleteComicTagsTable } from "../models/comicTags.js";
import { deleteComicTeamsTable } from "../models/comicTeams.js";
import { deleteComicBookMetadataCharacterMappingTable } from "../models/comicBookMetadataCharacterMapping.js";
import { initializeDatabase } from "../startup.js";

export const purgeService = async (req, res) => {
    try {
        // Drop dependent tables or constraints first
        // comic_book_metadata_roles
        await deleteComicBookMetadataRolesTable();
        // comic_series_folders
        await deleteComicBookSeriesMappingTable();
        // comic_book_metadata_series_group_mapping
        await deleteComicBookMetadataSeriesGroupMappingTable();
        // comic_book_metadata_genre_mapping
        await deleteComicBookMetadataGenreMappingTable();
        // comic_book_metadata_character_mapping
        await deleteComicBookMetadataCharacterMappingTable();
        
        // Drop the main tables
        // comic_book_metadata
        await deleteComicBookMetadataTable();
        // comic_book_roles
        await deleteComicBookRolesTable();
        // comic_book_file
        await deleteComicBookTable();
        // comic_series_folders
        await deleteComicSeriesFoldersTable();
        // comic_folder
        await deleteComicFolderTable();
        // comic_series 
        await deleteComicSeriesTable();
        // comic_publisher
        await deleteComicPublisherTable();
        // comic_imprint
        await deleteComicImprintTable();
        // comic_series_group
        await deleteComicSeriesGroupTable();
        // comic_genre
        await deleteComicGenreTable();
        // comic_characters
        await deleteComicCharactersTable();
        // comic_country
        await deleteComicCountryTable();
        // comic_format
        await deleteComicFormatTable();
        // comic_language
        await deleteComicLanguageTable();
        // comic_locations
        await deleteComicLocationsTable();
        // comic_manga_settings
        await deleteComicMangaSettingsTable();
        // comic_ratings
        await deleteComicRatingsTable();
        // comic_tags
        await deleteComicTagsTable();
        // comic_teams
        await deleteComicTeamsTable();
        // comic_series_story_arc
        await deleteComicSeriesStoryArcTable();

        
        // recreate the tables  
        await initializeDatabase();
    
        res.status(200).send("All tables purged successfully.");
    } catch (err) {
        console.error("Error purging tables:", err);
        res.status(500).send("Error purging tables.");
    }
}