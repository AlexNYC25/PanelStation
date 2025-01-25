import {
  addFilesToDatabase
} from "../services/ingestService.js";

export const startIngest = async (req, res) => {
  try {
    const ingestSummary = await addFilesToDatabase();

    res.status(200).send(ingestSummary);
  } catch (err) {
    console.error("Error adding folders and files to database:", err);
  }
};
