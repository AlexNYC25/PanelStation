import express from "express";

import comicBookRoutes from "./comicBook.js";
import comicSeriesRoutes from "./comicSeries.js";

const router = express.Router();

router.use("/comicBook", comicBookRoutes);
router.use("/comicSeries", comicSeriesRoutes);

export default router;