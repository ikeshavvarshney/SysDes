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
import workflowRoutes from "./routes/workflowRoutes.js";
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

// ======================
// LAYOUT SCHEMA & MODEL
// ======================
const LayoutSchema = new mongoose.Schema({
  name: { type: String, default: 'Untitled Design' },
  nodes: { type: mongoose.Schema.Types.Mixed },
  edges: { type: mongoose.Schema.Types.Mixed },
  viewport: { type: mongoose.Schema.Types.Mixed },
  config: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const Layout = mongoose.model('Layout', LayoutSchema);

// ======================
// API ROUTES
// ======================

// Health Check
app.get('/', (req, res) => res.send('✅ System Design API Running'));

// POST: Save a NEW Layout
app.post('/api/layouts', async (req, res) => {
  try {
      const { nodes, edges, viewport, config, name } = req.body;
      
      const newLayout = new Layout({
          name: name || `Untitled - ${new Date().toLocaleTimeString()}`,
          nodes,
          edges,
          viewport,
          config,
          createdAt: new Date(),
          updatedAt: new Date()
      });

      const savedLayout = await newLayout.save();
      console.log(`✅ Saved: ${savedLayout.name} (${savedLayout._id})`);
      res.status(201).json({ success: true, data: savedLayout });
  } catch (error) {
      console.error("Save error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});

// GET (List): Retrieve ALL layouts (Just Name, ID, Date) - for the list menu
app.get('/api/layouts', async (req, res) => {
  try {
      // Only select name, _id, createdAt, and updatedAt to keep it fast
      const layouts = await Layout.find({}, 'name createdAt updatedAt')
          .sort({ createdAt: -1 });
      
      console.log(`📋 Retrieved ${layouts.length} layouts`);
      res.status(200).json({ success: true, data: layouts });
  } catch (error) {
      console.error("List error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});

// GET (Detail): Retrieve ONE specific layout by ID
app.get('/api/layouts/:id', async (req, res) => {
  try {
      const layout = await Layout.findById(req.params.id);
      if (!layout) {
          return res.status(404).json({ 
              success: false, 
              message: "Layout not found" 
          });
      }
      
      console.log(`📂 Loaded: ${layout.name}`);
      res.status(200).json({ success: true, data: layout });
  } catch (error) {
      console.error("Load error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH: Update/Rename a layout
app.patch('/api/layouts/:id', async (req, res) => {
  try {
      const { name, nodes, edges, viewport, config } = req.body;
      
      const updateData = {
          updatedAt: new Date()
      };
      
      // Only update fields that are provided
      if (name !== undefined) updateData.name = name;
      if (nodes !== undefined) updateData.nodes = nodes;
      if (edges !== undefined) updateData.edges = edges;
      if (viewport !== undefined) updateData.viewport = viewport;
      if (config !== undefined) updateData.config = config;
      
      const updatedLayout = await Layout.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true } // Return the updated document
      );
      
      if (!updatedLayout) {
          return res.status(404).json({ 
              success: false, 
              message: "Layout not found" 
          });
      }
      
      console.log(`✏️ Updated: ${updatedLayout.name}`);
      res.status(200).json({ success: true, data: updatedLayout });
  } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove a layout
app.delete('/api/layouts/:id', async (req, res) => {
  try {
      const deletedLayout = await Layout.findByIdAndDelete(req.params.id);
      
      if (!deletedLayout) {
          return res.status(404).json({ 
              success: false, 
              message: "Layout not found" 
          });
      }
      
      console.log(`🗑️ Deleted: ${deletedLayout.name}`);
      res.status(200).json({ 
          success: true, 
          message: "Deleted successfully",
          data: { id: req.params.id }
      });
  } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Latest layout (for auto-restore on startup)
app.get('/api/layouts/latest', async (req, res) => {
  try {
      const latestLayout = await Layout.findOne().sort({ createdAt: -1 });
      
      if (!latestLayout) {
          return res.status(404).json({ 
              success: false, 
              message: "No layouts found" 
          });
      }
      
      console.log(`⚡ Latest: ${latestLayout.name}`);
      res.status(200).json({ success: true, data: latestLayout });
  } catch (error) {
      console.error("Latest error:", error);
      res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// OTHER ROUTES
// ======================
app.use("/api/users", userRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/components", componentRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/chatbot", chatbotRoutes);

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Layout Management API Ready`);
});