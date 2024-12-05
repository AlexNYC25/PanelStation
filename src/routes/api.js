import express from "express";

import comicBookRoutes from "./comicBook.js";
import comicSeriesRoutes from "./comicSeries.js";
import injestRoutes from "./injest.js";
import purgeRoutes from "./purge.js";

const router = express.Router();

router.use("/injest", injestRoutes);
router.use("/purge", purgeRoutes);
router.use("/comicBook", comicBookRoutes);
router.use("/comicSeries", comicSeriesRoutes);

export default router;
