import {
  addFilesToDatabase,
  addFoldersToDatabase,
} from "../services/ingestService.js";

export const startIngest = async (req, res) => {
  try {
    await addFoldersToDatabase();
    await addFilesToDatabase();
  } catch (err) {
    console.error("Error adding folders and files to database:", err);
  }
};
