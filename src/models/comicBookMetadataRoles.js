import { runQuery } from "../config/dbConnection.js";
import { logger } from "../utilities/logger.js";

export const checkAndCreateComicBookMetadataRolesTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_metadata_roles'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_metadata_roles (
      id SERIAL PRIMARY KEY,
      metadata_id INTEGER REFERENCES comic_book_metadata(id),
      role_id INTEGER REFERENCES comic_book_roles(id),
      UNIQUE (metadata_id, role_id)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      logger.debug("comic_book_metadata_roles table created successfully.");
    } else {
      logger.debug("comic_book_metadata_roles table already exists.");
    }
  } catch (err) {
    logger.error(
      "Error checking or creating comic_book_metadata_roles table:",
      err
    );
  }
};

export const deleteComicBookMetadataRolesTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_book_metadata_roles;
  `;

  try {
    await runQuery(query);
    logger.debug("comic_book_metadata_roles table deleted successfully.");
  } catch (err) {
    logger.error("Error deleting comic_book_metadata_roles table:", err);
  }
};

export const insertComicBookMetadataRolesIntoDb = async (metadataRoleObj) => {
  const { metadataId, roleId } = metadataRoleObj;
  const query = `
    INSERT INTO comic_book_metadata_roles (metadata_id, role_id)
    VALUES ($1, $2)
    RETURNING id;
  `;

  try {
    const result = await runQuery(query, [metadataId, roleId]);
    return { success: true, comicBookMetadataRoleId: result[0].id };
  } catch (err) {
    logger.error("Error inserting comic_book_metadata_roles:", err);
    return { success: false };
  }
}