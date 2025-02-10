import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataLocationMappingTable = async () => {
	const checkTableQuery = `
						SELECT EXISTS (
						SELECT FROM information_schema.tables 
						WHERE table_schema = 'public' 
						AND table_name = 'comic_book_metadata_location_mapping'
						);
		`;

	const createTableQuery = `
						CREATE TABLE comic_book_metadata_location_mapping (
						id SERIAL PRIMARY KEY,
						comic_book_metadata_id INTEGER REFERENCES comic_book_metadata(id),
						location_id INTEGER REFERENCES comic_locations(id),
						UNIQUE (comic_book_metadata_id, location_id)
						);
		`;

	try {
		const result = await runQuery(checkTableQuery);
		const tableExists = result[0].exists;

		if (!tableExists) {
			await runQuery(createTableQuery);
			logger.debug(
				"comic_book_metadata_location_mapping table created successfully."
			);
		} else {
			logger.debug("comic_book_metadata_location_mapping table already exists.");
		}
	} catch (err) {
		logger.error(
			"Error checking or creating comic_book_metadata_location_mapping table:",
			err
		);
	}
};

export const deleteComicBookMetadataLocationMappingTable = async () => {
	const deleteTableQuery = `
						DROP TABLE IF EXISTS comic_book_metadata_location_mapping;
		`;

	try {
		await runQuery(deleteTableQuery);
		logger.debug(
			"comic_book_metadata_location_mapping table deleted successfully."
		);
	} catch (err) {
		logger.error(
			"Error deleting comic_book_metadata_location_mapping table:",
			err
		);
	}
};

export const insertComicBookMetadataLocationMappingIntoDb = async (
	metadataId,
	locationId
) => {
	const insertQuery = `
						INSERT INTO comic_book_metadata_location_mapping (comic_book_metadata_id, location_id)
						VALUES ($1, $2)
						RETURNING *;
		`;

	try {
		const result = await runQuery(insertQuery, [metadataId, locationId]);
		logger.debug(
			"Comic book metadata location mapping inserted successfully."
		);
		return result;
	} catch (err) {
		logger.error(
			"Error inserting comic book metadata location mapping:",
			err
		);
	}
};