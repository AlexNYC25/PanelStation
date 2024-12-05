import { getAllComicSeriesFromDb, getComicSeriesByIdFromDb } from "../models/comicSeries.js";
import { getComicBooksBySeriesIdFromDb } from "../models/comicBookSeriesMapping.js";
import { compressMultipleCbzFiles } from "../utilities/comicBookDataDirectory.js";

export const getComicSeries = async (req, res) => {
  try {
    const comicSeries = await getAllComicSeriesFromDb();
    res.json(comicSeries);
  } catch (err) {
    res.status(500).send("Error getting comic series");
  }
};

export const getComicSeriesById = async (req, res) => {
  try {
    const comicSeries = await getComicSeriesByIdFromDb(req.params.id);
    res.json(comicSeries);
  } catch (err) {
    res.status(500).send("Error getting comic series");
  }
}

export const getComicBooksBySeriesId = async (req, res) => {
  try {
    const comicBooks = await getComicBooksBySeriesIdFromDb(req.params.id);
    let cbzFiles = [];
    comicBooks.forEach((comicBook) => {
      cbzFiles.push(comicBook.file_path);
    });
    const cbzFilePath = compressMultipleCbzFiles(cbzFiles);
    res.download(cbzFilePath, `${req.params.id}.zip`);
  } catch (err) {
    res.status(500).send("Error getting comic books for series");
  }
}