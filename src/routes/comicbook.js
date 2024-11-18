import express from "express";

import { getBook } from "../controllers/bookController.js";

const router = express.Router();

router.get("/book/:id", getBook);

export default router;
