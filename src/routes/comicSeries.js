import express from "express";
import { getComicSeries, getComicSeriesById, getComicBooksBySeriesId } from "../controllers/seriesController.js";

const router = express.Router();

router.get("/all", getComicSeries);

router.get("/:id", getComicSeriesById);

router.get("/:id/download", getComicBooksBySeriesId);

export default router;
