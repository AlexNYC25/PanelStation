import express from "express";

import { getComicBookPath } from "../models/comicBook.js";

const router = express.Router();

router.get("/file/:id", (req, res) => {
  const fileId = req.params.id;
  getComicBookPath(fileId)
    .then((result) => {
      if (result.length === 0) {
        res.status(404).send(`File with id ${fileId} not found`);
      } else {
        let filePath = result[0].file_path;
        res.download(filePath);
      }
    })
    .catch((error) => {
      res.status(500).send(`Error retrieving file: ${error.message}`);
    });
});

export default router;
