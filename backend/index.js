import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";

import userRoutes from "./routes/userRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import componentRoutes from "./routes/componentRoutes.js";
import commitRoutes from "./routes/commitRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";

// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/security", securityRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running with ES Modules!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


