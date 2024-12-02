import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Comic Files route root");
});

export default router;
