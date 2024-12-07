import { deleteComicBookTable } from "../models/comicBook.js";
import { deleteComicBookMetadataTable } from "../models/comicBookMetadata.js";
import { deleteComicBookMetadataRolesTable } from "../models/comicBookMetadataRoles.js";
import { deleteComicBookRolesTable } from "../models/comicBookRoles.js";
import { deleteComicBookSeriesMappingTable } from "../models/comicBookSeriesMapping.js";
import { deleteComicFolderTable } from "../models/comicFolder.js";
import { deleteComicSeriesTable } from "../models/comicSeries.js";
import { deleteComicSeriesFoldersTable } from "../models/comicSeriesFolders.js";
import { initializeDatabase } from "../startup.js";

export const purgeService = async (req, res) => {
    try {
        // Drop dependent tables or constraints first
        await deleteComicBookMetadataRolesTable();
        await deleteComicBookSeriesMappingTable();
        
        // Drop the main tables
        await deleteComicBookMetadataTable();
        await deleteComicBookRolesTable();
        await deleteComicBookTable();
        await deleteComicSeriesFoldersTable();
        await deleteComicFolderTable();
        await deleteComicSeriesTable();

        // recreate the tables
        await initializeDatabase();
    
        res.status(200).send("All tables purged successfully.");
    } catch (err) {
        console.error("Error purging tables:", err);
        res.status(500).send("Error purging tables.");
    }
}