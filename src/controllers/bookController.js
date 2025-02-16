import fs from "fs";
import path from "path";

import { getComicBookPathFromDb, getComicBooksInDb } from "../models/comicBook.js";
import { uncompressCbzFile } from "../utilities/comicBookDataDirectory.js";

export const getAllBooks = async (req, res) => {
  try {
    const books = await getComicBooksInDb();
    res.send(books);
  } catch (error) {
    res.status(500).send(`Error retrieving books: ${error.message}`);
  }
};

export const getBookById = async (req, res) => {
  const bookId = req.params.id;

  try {
    const book = await getComicBookPathFromDb(bookId);
    if (book.length === 0) {
      res.status(404).send(`Book with id ${bookId} not found`);
    } else {
      res.send(book[0]);
    }
  } catch (error) {
    res.status(500).send(`Error retrieving book: ${error.message}`);
  }
};

export const getBookDownload = async (req, res) => {
  const bookId = req.params.id;

  try {
    const book = await getComicBookPathFromDb(bookId);
    if (book.length === 0) {
      res.status(404).send(`Book with id ${bookId} not found`);
    } else {
      const filePath = book[0].file_path;
      res.download(filePath);
    }
  } catch (error) {
    res.status(500).send(`Error retrieving file: ${error.message}`);
  }
};

export const getBookPage = async (req, res) => {
  const bookId = req.params.id;
  const pageNumber = req.params.page;

  try {
    const book = await getComicBookPathFromDb(bookId);
    if (book.length === 0) {
      res.status(404).send(`Book with id ${bookId} not found`);
    } else {
      const filePath = book[0].file_path;
      try {
        const outputDir = uncompressCbzFile(filePath);

        // Get the list of files in the output directory
        const files = fs.readdirSync(outputDir);
        const page = files[pageNumber - 1];
        const pagePath = path.join(outputDir, page);
        res.download(pagePath);
      } catch (error) {
        res.status(500).send(`Error uncompressing book: ${error.message}`);
      }
    }
  } catch (error) {
    res.status(500).send(`Error retrieving book page: ${error.message}`);
  }
}
