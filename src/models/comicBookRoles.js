import { runQuery } from "../config/dbConnection.js";

export const checkAndCreateComicBookRolesTable = async () => {
  const checkTableQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'comic_book_roles'
    );
  `;

  const createTableQuery = `
    CREATE TABLE comic_book_roles (
      id SERIAL PRIMARY KEY,
      writer VARCHAR(255),
      cover_artist VARCHAR(255),
      editor VARCHAR(255),
      inker VARCHAR(255),
      colorist VARCHAR(255),
      letterer VARCHAR(255),
      penciller VARCHAR(255)
    );
  `;

  try {
    const result = await runQuery(checkTableQuery);
    const tableExists = result[0].exists;

    if (!tableExists) {
      await runQuery(createTableQuery);
      console.log("comic_book_roles table created successfully.");
    } else {
      console.log("comic_book_roles table already exists.");
    }
  } catch (err) {
    console.error("Error checking or creating comic_book_roles table:", err);
  }
};

export const deleteComicBookRolesTable = async () => {
  const query = `
    DROP TABLE IF EXISTS comic_book_roles;
  `;

  try {
    await runQuery(query);
    console.log("comic_book_roles table deleted successfully.");
  } catch (err) {
    console.error("Error deleting comic_book_roles table:", err);
  }
};

export const insertComicBookRolesIntoDb = async (roles) => {
  const insertQuery = `
    INSERT INTO comic_book_roles (
      writer,
      cover_artist,
      editor,
      inker,
      colorist,
      letterer,
      penciller
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7
    ) RETURNING id;
  `;

  try {
    const result = await runQuery(insertQuery, [
      roles.writer,
      roles.cover_artist,
      roles.editor,
      roles.inker,
      roles.colorist,
      roles.letterer,
      roles.penciller,
    ]);
    console.log("Inserted comic book roles into comic_book_roles table.");
    return { success: true, comicBookRolesId: result[0].id };
  } catch (err) {
    console.error("Error inserting comic book roles:", err);
    return null;
  }
}