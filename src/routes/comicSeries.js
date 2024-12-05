import express from "express";
import { getComicSeries } from "../controllers/seriesController.js";

const router = express.Router();

router.get("/all", getComicSeries);

router.get("/:id", (req, res) => {
  res.send(`Series ${req.params.id}`);
});

router.get("/:id/download", (req, res) => {
  res.send(`Download series ${req.params.id}`);
});

export default router;
