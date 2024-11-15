// index.js
import app from './src/app.js';
import { checkComicBookDataDirectoryExists, checkAndCreateComicBookTable, checkAndCreateComicFolderTable, checkAndCreateComicSeriesTable } from './src/startup.js';
import { connectToDatabase } from './src/config/dbConnection.js';

const PORT = process.env.PORT || 3000;

connectToDatabase();
checkComicBookDataDirectoryExists();

checkAndCreateComicBookTable();
checkAndCreateComicFolderTable();
checkAndCreateComicSeriesTable();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});