// testing.js
import express from "express";

import {
  listFiles,
  addFilesToDatabase,
  listFoldersWithAllowedFiles,
  addFoldersToDatabase
} from "../utilities/comicBookDataDirectory.js"; // Update the path as needed
import { getComicBooks } from "../models/comicBook.js"; // Update the path as needed

const router = express.Router();

// Define your routes
router.get("/", (req, res) => {
  res.send("Test route root");
});

router.get("/files", (req, res) => {
  try {
    const filesListJson = listFiles();
    res.json(JSON.parse(filesListJson));
  } catch (error) {
    res.status(500).send(`Error retrieving files: ${error.message}`);
  }
});

router.get("/folders", (req, res) => {
  try {
    // Add files to the database
    res.json(JSON.parse(listFoldersWithAllowedFiles()));
  } catch (error) {
    res.status(500).send(`Error ingesting files: ${error.message}`);
  }
});

router.get("/ingest", (req, res) => {
  try {
    addFilesToDatabase();
    // Add files to the database
    res.send("Files ingested successfully");
  } catch (error) {
    res.status(500).send(`Error ingesting files: ${error.message}`);
  }
});

router.get("/ingestFolders", (req, res) => {
  try {
    addFoldersToDatabase();
    // Add files to the database
    res.send("Folders ingested successfully");
  } catch (error) {
    res.status(500).send(`Error ingesting files: ${error.message}`);
  }
});

router.get("/filesInDB", (req, res) => {
  const filesListJson = getComicBooks()
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((error) => {
      res.status(500).send(`Error retrieving files: ${error.message}`);
    });
});

// Export the router
export default router;
