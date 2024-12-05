// testing.js
import express from "express";

import {
  getFilesWithComicInfoXml,
  uncompressCbzFile,
} from "../utilities/comicBookDataDirectory.js"; // Update the path as needed
import { getComicBooksInDb } from "../models/comicBook.js"; // Update the path as needed
import {
  addFilesToDatabase,
  addFoldersToDatabase,
} from "../services/ingestService.js";

const router = express.Router();

// Define your routes
router.get("/", (req, res) => {
  res.send("Test route root");
});

router.get("/ingest", (req, res) => {
  try {
    addFoldersToDatabase();
    addFilesToDatabase();
    // Add files to the database
    res.send("Files ingested successfully");
  } catch (error) {
    res.status(500).send(`Error ingesting files: ${error.message}`);
  }
});

// TODO: Remove does not seems to be used
router.get("/filesInDB", (req, res) => {
  const filesListJson = getComicBooksInDb()
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((error) => {
      res.status(500).send(`Error retrieving files: ${error.message}`);
    });
});

// TODO: Remove just used to test the xml parsing
router.get("/testhasxml", (req, res) => {
  try {
    const filesList = getFilesWithComicInfoXml();
    const firstFile = filesList[0];
    uncompressCbzFile(firstFile);
    res.json(filesList);
  } catch (error) {
    res.status(500).send(`Error retrieving files: ${error.message}`);
  }
});

// Export the router
export default router;
