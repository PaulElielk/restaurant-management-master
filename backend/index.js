import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import router from "./routes/routes.js";

const __dirname = path.resolve();
const app = express();

// Middleware: Body parsing & CORS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Mount API & application routes
app.use(router);

// Health check endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to restaurant api' });
});

// Serve frontend SPA build and handle client-side routing fallback
app.use(express.static(path.join(__dirname, './restaurant_management/')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, './restaurant_management/index.html'));
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});