import express from "express";

import { addFilesToDatabase, addFoldersToDatabase } from "../services/injestService.js";

const router = express.Router();

router.get("/start", async () => {
  try {
    await addFoldersToDatabase();
    await addFilesToDatabase();
  }
  catch (err) {
    console.error("Error adding folders and files to database:", err);
  }
});

export default router;
