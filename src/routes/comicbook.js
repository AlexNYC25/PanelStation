import express from "express";

import {
  getBookById,
  getAllBooks,
  getBookDownload,
  getBookPage,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/all", getAllBooks);

router.get("/:id", getBookById);

router.get("/:id/download", getBookDownload);

router.get("/:id/page/:page", getBookPage);

export default router;
