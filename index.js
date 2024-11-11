// index.js
import app from './src/app.js';
import { checkComicBookDataDirectoryExists } from './src/startup.js';


const PORT = process.env.PORT || 3000;

checkComicBookDataDirectoryExists();

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});