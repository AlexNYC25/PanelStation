import express from "express";

import comicBookRoutes from "./comicBook.js";
import comicSeriesRoutes from "./comicSeries.js";
import injestRoutes from "./injest.js";

const router = express.Router();

router.use("/injest", injestRoutes);
router.use("/comicBook", comicBookRoutes);
router.use("/comicSeries", comicSeriesRoutes);

export default router;
