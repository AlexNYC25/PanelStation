import express from "express";

const router = express.Router();

router.get("/start", () => {
  console.log("Ingesting files");
});

export default router;
