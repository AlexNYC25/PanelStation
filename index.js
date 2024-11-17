// index.js
import app from "./src/app.js";
import {
  checkComicBookDataDirectoryExists,
  checkAndCreateComicBookTable,
  checkAndCreateComicFolderTable,
  checkAndCreateComicSeriesTable,
  checkAndCreateComicSeriesFoldersTable,
  checkAndCreateComicBookRolesTable,
  checkAndCreateComicBookMetadataTable
} from "./src/startup.js";
import { connectToDatabase } from "./src/config/dbConnection.js";

const PORT = process.env.PORT || 3000;

connectToDatabase();
checkComicBookDataDirectoryExists();

const initializeDatabase = async () => {
  await checkAndCreateComicBookTable();
  await checkAndCreateComicFolderTable();
  await checkAndCreateComicSeriesTable();
  await checkAndCreateComicSeriesFoldersTable();
  await checkAndCreateComicBookRolesTable();
  await checkAndCreateComicBookMetadataTable();
};

initializeDatabase().then(() => {
  // Start the server after the database initialization is complete
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error during database initialization:', err);
});
