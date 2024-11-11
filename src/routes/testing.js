// testing.js
import express from 'express';

import { getFilesList } from '../utilities/comicBookDataDirectory.js'; // Update the path as needed

const router = express.Router();

// Define your routes
router.get('/', (req, res) => {
  res.send('Test route root');
});

router.get('/files', (req, res) => {
    try {
        const filesListJson = getFilesList();
        res.json(JSON.parse(filesListJson));
      } catch (error) {
        res.status(500).send(`Error retrieving files: ${error.message}`);
      }
});

// Export the router
export default router;