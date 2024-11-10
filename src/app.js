// app.js
import express, { json, urlencoded } from 'express';

const app = express();

// Middleware
app.use(json()); // Parse JSON bodies
app.use(urlencoded({ extended: true })); // Parse URL-encoded bodies

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Express API!');
});


export default app;
