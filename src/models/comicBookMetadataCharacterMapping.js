import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataCharacterMappingTable =
  async () => {
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
        logger.debug(
          "comic_book_metadata_character_mapping table already exists."
        );
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

	const selectQuery = `
		SELECT * FROM comic_book_metadata_character_mapping
		WHERE comic_book_metadata_id = $1 AND character_id = $2;
	`;

  try {
    const selectResult = await runQuery(selectQuery, [metadataId, characterId]);

		if (selectResult.length === 0) {
			const insertResult = await runQuery(insertQuery, [metadataId, characterId]);
			logger.debug(
				`Comic book metadata ${metadataId} and character ${characterId} mapping inserted successfully.`
			);
			return insertResult[0];
		} else {
			logger.debug(
				`Comic book metadata ${metadataId} and character ${characterId} mapping already exists.`
			);
			return selectResult[0];
		}
  } catch (err) {
    logger.error("Error inserting comic book metadata character mapping:", err);
  }
};
