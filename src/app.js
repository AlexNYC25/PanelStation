// app.js
import express, { json, urlencoded } from 'express';

import testRoutes from './routes/testing.js';

const app = express();

// Middleware
app.use(json()); // Parse JSON bodies
app.use(urlencoded({ extended: true })); // Parse URL-encoded bodies

// routes
app.use('/testing', testRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to the Express API!');
});


export default app;
