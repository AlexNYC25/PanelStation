import express from "express";
import { getComicSeries } from "../controllers/seriesController.js";

const router = express.Router();

router.get("/all", getComicSeries);

export default router;
