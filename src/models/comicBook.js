import { runQuery } from "../config/dbConnection.js";

const getComicBooks = async () => {
  const query = `
    SELECT * FROM comic_book;
  `;

  try {
    const comicBooks = await runQuery(query);
    return comicBooks;
  } catch (err) {
    console.error("Error getting comic books:", err);
    throw err;
  }
};

const getComicBookPath = async (id) => {
  const query = `
		SELECT file_path FROM comic_book WHERE id = $1;
	`;

  try {
    const comicBook = await runQuery(query, [id]);
    return comicBook;
  } catch (err) {
    console.error("Error getting comic book path:", err);
    throw err;
  }
};

export { getComicBooks, getComicBookPath };
