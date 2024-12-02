import { runQuery } from "../config/dbConnection.js";

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
      console.log("comic_book_metadata_roles table created successfully.");
    } else {
      console.log("comic_book_metadata_roles table already exists.");
    }
  } catch (err) {
    console.error(
      "Error checking or creating comic_book_metadata_roles table:",
      err
    );
  }
};
