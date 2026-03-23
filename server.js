import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve statically built Vite files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve ads.txt and robots.txt explicitly from root
app.get('/ads.txt', (req, res) => res.sendFile(path.join(__dirname, 'ads.txt')));
app.get('/robots.txt', (req, res) => res.sendFile(path.join(__dirname, 'robots.txt')));

// Send all other requests to index.html to allow SPA routing (if any)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
