import { runQuery } from "../config/dbConnection.js";

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
      comic_book_id INTEGER REFERENCES comic_book(id),
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
      review TEXT
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_book_metadata table created successfully.");
    } else {
      console.log("comic_book_metadata table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_book_metadata table:", err);
  }
};

export const deleteComicBookMetadataTable = async () => {
  const deleteTableQuery = `
    DROP TABLE IF EXISTS comic_book_metadata;
  `;

  try {
    await runQuery(deleteTableQuery);
    console.log("comic_book_metadata table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_book_metadata table:", err);
  }
};

export const insertComicBookMetadataIntoDb = async (metadata) => {
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
      publisher,
      imprint,
      web,
      page_count,
      format,
      scan_information,
      rating,
      main_character_or_team,
      review
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
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
    metadata.publisher,
    metadata.imprint,
    metadata.web,
    metadata.pageCount,
    metadata.format,
    metadata.scanInformation,
    metadata.rating,
    metadata.mainCharacterOrTeam,
    metadata.review,
  ];

  try {
    const result = await runQuery(insertQuery, values);
    return { success: true, id: result[0].id };
  } catch (err) {
    console.error("Error inserting comic book metadata:", err);
    return { success: false };
  }
}
