// index.js
import app from "./src/app.js";
import {
  checkComicBookDataDirectoryExists,
  initializeDatabase,
} from "./src/startup.js";
import { connectToDatabase } from "./src/config/dbConnection.js";

const PORT = process.env.PORT || 3000;

connectToDatabase();
checkComicBookDataDirectoryExists();

initializeDatabase()
  .then(() => {
    // Start the server after the database initialization is complete
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during database initialization:", err);
  });
