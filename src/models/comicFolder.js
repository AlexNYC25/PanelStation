import { runQuery } from "../config/dbConnection.js";

let getComicFolders = async () => {
  const query = `
		SELECT * FROM comic_folder;
	`;

  try {
    const comicFolders = await runQuery(query);
    return comicFolders;
  } catch (err) {
    console.error("Error getting comic folders:", err);
    throw err;
  }
};

export { getComicFolders };
