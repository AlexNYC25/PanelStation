import express from "express";

import comicBookRoutes from "./comicBook.js";
import comicSeriesRoutes from "./comicSeries.js";
import ingestRoutes from "./ingest.js";
import purgeRoutes from "./purge.js";

const router = express.Router();

router.use("/ingest", ingestRoutes);
router.use("/purge", purgeRoutes);
router.use("/comicBook", comicBookRoutes);
router.use("/comicSeries", comicSeriesRoutes);

export default router;
