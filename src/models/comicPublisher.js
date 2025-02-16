import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicPublisherTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'comic_publisher'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_publisher (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    UNIQUE (name)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_publisher table created successfully.");
    } else {
      logger.debug("comic_publisher table already exists.");
    }
  } catch (err) {
    logger.error("Error checking or creating comic_publisher table:", err);
  }
};

export const deleteComicPublisherTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_publisher;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_publisher table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_publisher table:", err);
  }
};

export const insertComicPublisherIntoDb = async (publisherName) => {
  const insertQuery = `
    INSERT INTO comic_publisher (name)
    VALUES ($1)
    ON CONFLICT (name) DO NOTHING
    RETURNING id;
  `;

  const selectQuery = `
    SELECT id
    FROM comic_publisher
    WHERE name = $1;
  `

  try {
    const insertResult = await runQuery(insertQuery, [publisherName])

    if (insertResult.length > 0 ) {
      logger.debug(
        `Inserted comic publisher: ${publisherName} into the comic_publisher db`
      )

      return Number.parseInt(insertResult[0].id)
    }

    const selectResult = await runQuery(selectQuery, [publisherName])

    if (selectResult.length > 0) {
      logger.debug(
        `Comic Publisher ${publisherName} already exists in the comic_publisher db table`
      )

      return Number.parseInt(selectResult[0]?.id)
    }

  } catch (err) {
    logger.error("Error inserting comic publisher into db:", err);
  }
};

export const getPublisherId = async (publisherName) => {
  const query = `
    SELECT id
    FROM comic_publisher
    WHERE name = $1;
  `;

  try {
    const result = await runQuery(query, [publisherName]);
    return result[0]?.id;
  } catch (err) {
    logger.error("Error getting publisher id:", err);
  }
};
