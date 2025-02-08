import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataTeamMappingTable = async () => {
	const checkTableQuery = `
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'comic_book_metadata_team_mapping'
		);
	`;

	const createTableQuery = `
		CREATE TABLE comic_book_metadata_team_mapping (
			id SERIAL PRIMARY KEY,
			comic_book_metadata_id INTEGER REFERENCES comic_book_metadata(id),
			team_id INTEGER REFERENCES comic_teams(id),
			UNIQUE (comic_book_metadata_id, team_id)
		);
	`;

	try {
		const result = await runQuery(checkTableQuery);
		const tableExists = result[0].exists;

		if (!tableExists) {
			await runQuery(createTableQuery);
			logger.debug("comic_book_metadata_team_mapping table created successfully.");
		} else {
			logger.debug("comic_book_metadata_team_mapping table already exists.");
		}
	} catch (err) {
		logger.error("Error checking or creating comic_book_metadata_team_mapping table:", err);
	}
};

export const deleteComicBookMetadataTeamMappingTable = async () => {
	const deleteTableQuery = `
		DROP TABLE IF EXISTS comic_book_metadata_team_mapping;
	`;

	try {
		await runQuery(deleteTableQuery);
		logger.debug("comic_book_metadata_team_mapping table deleted successfully.");
	} catch (err) {
		logger.error("Error deleting comic_book_metadata_team_mapping table:", err);
	}
};

export const insertComicBookMetadataTeamMappingIntoDb = async (comicBookMetadataId, teamId) => {
	const selectQuery = `
		SELECT id FROM comic_book_metadata_team_mapping 
		WHERE comic_book_metadata_id = $1 AND team_id = $2;
	`;

	const insertQuery = `
		INSERT INTO comic_book_metadata_team_mapping 
		(comic_book_metadata_id, team_id) 
		VALUES ($1, $2) 
		RETURNING id;
	`;

	try {
		const result = await runQuery(selectQuery, [comicBookMetadataId, teamId]);

		if (result.length === 0) {
			const insertResult = await runQuery(insertQuery, [comicBookMetadataId, teamId]);
			logger.debug(
				`Inserted comic_book_metadata_team_mapping with id: ${insertResult[0].id}`
			);
		} else {
			logger.debug("comic_book_metadata_team_mapping already exists.");
		}
	} catch (err) {
		logger.error("Error inserting comic_book_metadata_team_mapping into db:", err);
	}
};