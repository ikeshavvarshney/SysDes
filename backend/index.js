import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";

// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend is running with ES Modules!");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

