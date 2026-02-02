import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db.js";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import componentRoutes from "./routes/componentRoutes.js";
import commitRoutes from "./routes/commitRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import securityRoutes from "./routes/securityRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js"; // NEW
import chatbotRoutes from "./routes/chatbotRoutes.js";

// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
const LayoutSchema = new mongoose.Schema({
  name: { type: String, default: 'Untitled Design' },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  viewport: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      zoom: { type: Number, default: 1 }
  },
  config: {
      trafficLevel: { type: Number, default: 500 }
  },
  createdAt: { type: Date, default: Date.now }
});

const Layout = mongoose.model('Layout', LayoutSchema);

// --- API Routes ---

// GET: Check if server is running
app.get('/', (req, res) => {
  res.send('System Design Simulator API is running...');
});

// POST: Save a new layout
app.post('/api/layouts', async (req, res) => {
  try {
      const { nodes, edges, viewport, config, name } = req.body;

      const newLayout = new Layout({
          name: name || `Design ${new Date().toLocaleString()}`,
          nodes,
          edges,
          viewport,
          config
      });
      console.log(newLayout)
      const savedLayout = await newLayout.save();
      res.status(201).json({ success: true, data: savedLayout });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Retrieve the latest layout
// GET: Retrieve the latest layout
app.get('/api/layouts/latest', async (req, res) => {
  console.log("👉 GET /api/layouts/latest called"); // 1. Verify route is hit

  try {
      // Check if DB is ready (1 = connected)
      if (mongoose.connection.readyState !== 1) {
          console.log("❌ Database not connected yet");
          return res.status(500).json({ success: false, error: "Database not connected" });
      }

      const layout = await Layout.findOne().sort({ createdAt: -1 });

      // 2. Explicitly handle empty database
      if (!layout) {
          console.log("⚠️ Database query successful, but collection is EMPTY.");
          return res.status(404).json({ success: false, message: "No layouts found" });
      }

      console.log("✅ Layout Found ID:", layout._id); // 3. Print ID only (cleaner)
      res.status(200).json({ success: true, data: layout });

  } catch (error) {
      console.error("❌ Query Error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});
// Routes
app.use("/api/users", userRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/workflows", workflowRoutes); // NEW
app.use("/api/chatbot", chatbotRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running with complete functionality!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
