// app.js
import express, { json, urlencoded } from "express";

import testRoutes from "./routes/testing.js";
import comicBookRoutes from "./routes/comicBook.js";
import comicSeriesRoutes from "./routes/comicSeries.js";

const app = express();

// Middleware
app.use(json()); // Parse JSON bodies
app.use(urlencoded({ extended: true })); // Parse URL-encoded bodies

// routes
app.use("/testing", testRoutes); //TODO: REMOVE THIS LINE
app.use("/comicbook", comicBookRoutes);
app.use("/comicseries", comicSeriesRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the Express API!");
});

export default app;
