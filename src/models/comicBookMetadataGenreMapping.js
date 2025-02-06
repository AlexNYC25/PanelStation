import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataGenreMappingTable = async () => {
  const checkTableQuery = `
            SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'comic_book_metadata_genre_mapping'
            );
    `;

  const createTableQuery = `
            CREATE TABLE comic_book_metadata_genre_mapping (
            id SERIAL PRIMARY KEY,
            comic_book_metadata_id INTEGER REFERENCES comic_book_metadata(id),
            comic_genre_id INTEGER REFERENCES comic_genre(id),
            UNIQUE (comic_book_metadata_id, comic_genre_id)
            );
    `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug(
        "comic_book_metadata_genre_mapping table created successfully."
      );
    } else {
      logger.debug("comic_book_metadata_genre_mapping table already exists.");
    }
  } catch (err) {
    logger.error(
      "Error checking or creating comic_book_metadata_genre_mapping table:",
      err
    );
  }
};

export const deleteComicBookMetadataGenreMappingTable = async () => {
  const deleteTableQuery = `
            DROP TABLE IF EXISTS comic_book_metadata_genre_mapping;
    `;

  try {
    await runQuery(deleteTableQuery);
    logger.debug(
      "comic_book_metadata_genre_mapping table deleted successfully."
    );
  } catch (err) {
    logger.error(
      "Error deleting comic_book_metadata_genre_mapping table:",
      err
    );
  }
};

export const insertComicBookMetadataGenreMappingIntoDb = async (
  metadataId,
  genreId
) => {
  const insertQuery = `
    INSERT INTO comic_book_metadata_genre_mapping (comic_book_metadata_id, comic_genre_id)
    VALUES ($1, $2)
    ON CONFLICT (comic_book_metadata_id, comic_genre_id) DO NOTHING
    RETURNING id;
  `;

  const selectQuery = `
    SELECT id FROM comic_book_metadata_genre_mapping
    WHERE comic_book_metadata_id = $1 AND comic_genre_id = $2;
  `;

  try {
    const selectResult = await runQuery(selectQuery, [metadataId, genreId]);

    if (selectResult.length > 0) {
      logger.debug(
        `Comic book metadata genre mapping already exists with ID: ${selectResult[0].id}`
      );
      return;
    }

    const insertResult = await runQuery(insertQuery, [metadataId, genreId]);

    if (insertResult.length > 0) {
      logger.debug(
        `Inserted comic book metadata genre mapping with ID: ${insertResult[0].id}`
      );
    }
  } catch (err) {
    logger.error(
      "Error inserting comic book metadata genre mapping into the database:",
      err
    );
  }
};
