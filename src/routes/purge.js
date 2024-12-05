import express from "express";
import { purgeService } from "../services/purgeService.js";

const router = express.Router();

router.get("/", purgeService);

export default router;