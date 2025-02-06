import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataSeriesGroupMappingTable =
  async () => {
    const checkTableQuery = `
			SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'comic_book_metadata_series_group_mapping'
			);
	`;

    const createTableQuery = `
			CREATE TABLE comic_book_metadata_series_group_mapping (
			id SERIAL PRIMARY KEY,
			comic_book_metadata_id INTEGER REFERENCES comic_book_metadata(id),
			comic_series_group_id INTEGER REFERENCES comic_series_group(id),
			UNIQUE (comic_book_metadata_id, comic_series_group_id)
			);
	`;

    try {
      const result = await runQuery(checkTableQuery);
      const tableExists = result[0].exists;

      if (!tableExists) {
        await runQuery(createTableQuery);
        logger.debug(
          "comic_book_metadata_series_group_mapping table created successfully."
        );
      } else {
        logger.debug(
          "comic_book_metadata_series_group_mapping table already exists."
        );
      }
    } catch (err) {
      logger.error(
        "Error checking or creating comic_book_metadata_series_group_mapping table:",
        err
      );
    }
  };

export const deleteComicBookMetadataSeriesGroupMappingTable = async () => {
  const deleteTableQuery = `
			DROP TABLE IF EXISTS comic_book_metadata_series_group_mapping;
	`;

  try {
    await runQuery(deleteTableQuery);
    logger.debug(
      "comic_book_metadata_series_group_mapping table deleted successfully."
    );
  } catch (err) {
    logger.error(
      "Error deleting comic_book_metadata_series_group_mapping table:",
      err
    );
  }
};

export const insertComicBookMetadataSeriesGroupMappingIntoDb = async (
  metadataId,
  seriesGroupId
) => {
  const insertQuery = `
			INSERT INTO comic_book_metadata_series_group_mapping (comic_book_metadata_id, comic_series_group_id)
			VALUES ($1, $2)
			ON CONFLICT (comic_book_metadata_id, comic_series_group_id) DO NOTHING
			RETURNING id;
	`;

	const selectQuery = `
			SELECT id FROM comic_book_metadata_series_group_mapping
			WHERE comic_book_metadata_id = $1 AND comic_series_group_id = $2;
	`;

  try {
		const selectResult = await runQuery(selectQuery, [metadataId, seriesGroupId]);

		if (selectResult.length > 0) {
			logger.debug(
				`Mapping for comic_book_metadata_id ${metadataId} and comic_series_group_id ${seriesGroupId} already exists in comic_book_metadata_series_group_mapping table.`
			);
			return selectResult[0].id;
		}

		const insertResult = await runQuery(insertQuery, [metadataId, seriesGroupId]);

		if (insertResult.length > 0) {
			logger.debug(
				`Inserted mapping for comic_book_metadata_id ${metadataId} and comic_series_group_id ${seriesGroupId} into comic_book_metadata_series_group_mapping table.`
			);
			return insertResult[0].id;
		}

  } catch (err) {
    logger.error(
      "Error inserting comic_book_metadata_series_group_mapping:",
      err
    );
  }
};
