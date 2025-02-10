import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataStoryArcMappingTable = async () => {
	const checkTableQuery = `
			SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'comic_book_metadata_story_arc_mapping'
			);
	`;

	const createTableQuery = `
			CREATE TABLE comic_book_metadata_story_arc_mapping (
			id SERIAL PRIMARY KEY,
			comic_book_metadata_id INTEGER REFERENCES comic_book_metadata(id),
			comic_series_story_arc_id INTEGER REFERENCES comic_series_story_arc(id),
			UNIQUE (comic_book_metadata_id, comic_series_story_arc_id)
			);
	`;

	try {
		const result = await runQuery(checkTableQuery);
		const tableExists = result[0].exists;

		if (!tableExists) {
			await runQuery(createTableQuery);
			logger.debug(
				"comic_book_metadata_story_arc_mapping table created successfully."
			);
		} else {
			logger.debug(
				"comic_book_metadata_story_arc_mapping table already exists."
			);
		}
	} catch (err) {
		logger.error(
			"Error checking or creating comic_book_metadata_story_arc_mapping table:",
			err
		);
	}
};

export const deleteComicBookMetadataStoryArcMappingTable = async () => {
	const deleteTableQuery = `
			DROP TABLE IF EXISTS comic_book_metadata_story_arc_mapping;
	`;

	try {
		await runQuery(deleteTableQuery);
		logger.debug(
			"comic_book_metadata_story_arc_mapping table deleted successfully."
		);
	} catch (err) {
		logger.error(
			"Error deleting comic_book_metadata_story_arc_mapping table:",
			err
		);
	}
};

export const insertComicBookMetadataStoryArcMappingIntoDB = async (
	comicBookMetadataId,
	comicSeriesStoryArcId
) => {
	const insertQuery = `
			INSERT INTO comic_book_metadata_story_arc_mapping (
				comic_book_metadata_id,
				comic_series_story_arc_id
			) VALUES ($1, $2)
			RETURNING *;
	`;

	const selectQuery = `
			SELECT * FROM comic_book_metadata_story_arc_mapping
			WHERE comic_book_metadata_id = $1 AND comic_series_story_arc_id = $2;
	`;

	try {
		const selectResult = await runQuery(selectQuery, [
			comicBookMetadataId,
			comicSeriesStoryArcId,
		]);

		if (selectResult.length > 0) {
			logger.debug(
				"comic_book_metadata_story_arc_mapping record already exists."
			);
			return;
		}

		await runQuery(insertQuery, [comicBookMetadataId, comicSeriesStoryArcId]);
		logger.debug(
			"comic_book_metadata_story_arc_mapping record inserted successfully."
		);
	} catch (err) {
		logger.error(
			"Error inserting comic_book_metadata_story_arc_mapping:",
			err
		);
	}
};