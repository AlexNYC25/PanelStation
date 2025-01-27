import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_metadata'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_metadata (
      id SERIAL PRIMARY KEY,
      comic_book_id INTEGER REFERENCES comic_book_file(id) UNIQUE,
      series_name VARCHAR(255),
      title VARCHAR(255),
      issue_number VARCHAR(50),
      count INTEGER,
      volume VARCHAR(50),
      alt_series_name VARCHAR(255),
      alt_issue_number VARCHAR(50),
      alt_count INTEGER,
      summary TEXT,
      notes TEXT,
      publication_date DATE,
      web VARCHAR(255),
      page_count INTEGER,
      format VARCHAR(50),
      scan_information TEXT,
      rating VARCHAR(50),
      main_character_or_team VARCHAR(255),
      review TEXT,
      publisher_id INTEGER REFERENCES comic_publisher(id)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_book_metadata table created successfully.");
    } else {
      logger.debug("comic_book_metadata table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_book_metadata table:", err);
  }
};

export const deleteComicBookMetadataTable = async () => {
  const deleteTableQuery = `
    DROP TABLE IF EXISTS comic_book_metadata;
  `;

  try {
    await runQuery(deleteTableQuery);
    logger.debug("comic_book_metadata table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_book_metadata table:", err);
  }
};

export const insertComicBookMetadataIntoDb = async (metadata) => {

  // check if metadata value that are ment to be integers are actually integers
  if (metadata.count !== null && !Number.isInteger(metadata.count)) {
    throw new Error("count must be an integer or null: " + metadata.count + " is not an integer");
    
  }

  if (metadata.altCount !== null && !Number.isInteger(metadata.altCount)) {
    throw new Error("altCount must be an integer");
  }

  if (metadata.pageCount !== null && !Number.isInteger(metadata.pageCount)) {
    throw new Error("pageCount must be an integer");
  }

  if (metadata.comicBookId === null || metadata.comicBookId === undefined) {
    throw new Error("comicBookId cannot be null");
  }

  const insertQuery = `
    INSERT INTO comic_book_metadata (
      comic_book_id,
      series_name,
      title,
      issue_number,
      count,
      volume,
      alt_series_name,
      alt_issue_number,
      alt_count,
      summary,
      notes,
      publication_date,
      web,
      page_count,
      format,
      scan_information,
      rating,
      main_character_or_team,
      review,
      publisher_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    ON CONFLICT (comic_book_id) DO UPDATE SET
      series_name = EXCLUDED.series_name,
      title = EXCLUDED.title,
      issue_number = EXCLUDED.issue_number,
      count = EXCLUDED.count,
      volume = EXCLUDED.volume,
      alt_series_name = EXCLUDED.alt_series_name,
      alt_issue_number = EXCLUDED.alt_issue_number,
      alt_count = EXCLUDED.alt_count,
      summary = EXCLUDED.summary,
      notes = EXCLUDED.notes,
      publication_date = EXCLUDED.publication_date,
      web = EXCLUDED.web,
      page_count = EXCLUDED.page_count,
      format = EXCLUDED.format,
      scan_information = EXCLUDED.scan_information,
      rating = EXCLUDED.rating,
      main_character_or_team = EXCLUDED.main_character_or_team,
      review = EXCLUDED.review,
      publisher_id = EXCLUDED.publisher_id
    RETURNING id;
  `;

  const values = [
    metadata.comicBookId,
    metadata.seriesName,
    metadata.title,
    metadata.issueNumber,
    metadata.count,
    metadata.volume,
    metadata.altSeriesName,
    metadata.altIssueNumber,
    metadata.altCount,
    metadata.summary,
    metadata.notes,
    metadata.publicationDate,
    metadata.web,
    metadata.pageCount,
    metadata.format,
    metadata.scanInformation,
    metadata.rating,
    metadata.mainCharacterOrTeam,
    metadata.review,
    metadata.publisherId
  ];

  try {
    const insertResult = await runQuery(insertQuery, values);

    if (insertResult.length > 0) {
      logger.debug(
        `Inserted comicinfo.xml contents for comic book with the id ${metadata.comicBookId} into the comic_book_metadata table`
      )
      return { success: true, id: insertResult[0].id };
    }

    return {success: false}
    
  } catch (err) {
    logger.error("Error inserting comic book metadata:", err);
    return { success: false };
  }
}
