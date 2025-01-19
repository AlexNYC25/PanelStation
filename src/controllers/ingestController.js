import {
  addFilesToDatabase
} from "../services/ingestService.js";

export const startIngest = async (req, res) => {
  try {
    addFilesToDatabase();

    res.status(200).send("Ingest complete");
  } catch (err) {
    console.error("Error adding folders and files to database:", err);
  }
};
