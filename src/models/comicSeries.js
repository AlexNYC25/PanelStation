import { runQuery } from "../config/dbConnection.js";

let getAllComicSeries = async () => {
  const query = `
        SELECT * FROM comic_series;
    `;

  try {
    const comicSeries = await runQuery(query);
    return comicSeries;
  } catch (err) {
    console.error("Error getting comic series:", err);
    throw err;
  }
};

let getComicSeriesId = async (id) => {
  const query = `
        SELECT * FROM comic_series WHERE id = $1;
    `;

  try {
    const comicSeries = await runQuery(query, [id]);
    return comicSeries;
  } catch (err) {
    console.error("Error getting comic series:", err);
    throw err;
  }
};

export { getAllComicSeries };
