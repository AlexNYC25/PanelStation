import express from "express";

import { startIngest } from "../controllers/ingestController.js";

const router = express.Router();

router.get("/start", startIngest);

export default router;
