import { getAllComicSeries } from "../models/comicSeries.js";

let getComicSeries = async (req, res) => {
  try {
    const comicSeries = await getAllComicSeries();
    res.json(comicSeries);
  } catch (err) {
    res.status(500).send("Error getting comic series");
  }
};

export { getComicSeries };
