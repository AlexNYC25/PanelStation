import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataCharacterMappingTable = async () => {
	const checkTableQuery = `
						SELECT EXISTS (
						SELECT FROM information_schema.tables 
						WHERE table_schema = 'public' 
						AND table_name = 'comic_book_metadata_character_mapping'
						);
		`;

	const createTableQuery = `
						CREATE TABLE comic_book_metadata_character_mapping (
						id SERIAL PRIMARY KEY,
						comic_book_metadata_id INTEGER REFERENCES comic_book_metadata(id),
						character_id INTEGER REFERENCES comic_characters(id),
						UNIQUE (comic_book_metadata_id, character_id)
						);
		`;

	try {
		const result = await runQuery(checkTableQuery);
		const tableExists = result[0].exists;

		if (!tableExists) {
			await runQuery(createTableQuery);
			logger.debug(
				"comic_book_metadata_character_mapping table created successfully."
			);
		} else {
			logger.debug("comic_book_metadata_character_mapping table already exists.");
		}
	} catch (err) {
		logger.error(
			"Error checking or creating comic_book_metadata_character_mapping table:",
			err
		);
	}
};

export const deleteComicBookMetadataCharacterMappingTable = async () => {
	const deleteTableQuery = `
						DROP TABLE IF EXISTS comic_book_metadata_character_mapping;
		`;

	try {
		await runQuery(deleteTableQuery);
		logger.debug(
			"comic_book_metadata_character_mapping table deleted successfully."
		);
	} catch (err) {
		logger.error(
			"Error deleting comic_book_metadata_character_mapping table:",
			err
		);
	}
};

export const insertComicBookMetadataCharacterMappingIntoDb = async (
	metadataId,
	characterId
) => {
	const insertQuery = `
						INSERT INTO comic_book_metadata_character_mapping (comic_book_metadata_id, character_id)
						VALUES ($1, $2)
						RETURNING *;
		`;

	try {
		const result = await runQuery(insertQuery, [metadataId, characterId]);
		logger.debug(
			"Comic book metadata character mapping inserted successfully."
		);
		return result;
	} catch (err) {
		logger.error(
			"Error inserting comic book metadata character mapping:",
			err
		);
	}
};