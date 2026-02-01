import Template from "../models/template.js";

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await Template.find().populate("components");
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Track template usage
export const trackTemplateUsage = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ message: "Template not found" });
    
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();
    
    res.status(200).json({ 
      message: "Usage tracked", 
      usageCount: template.usageCount 
    });
  } catch (err) {
    res.status(500).json({ message: "Tracking failed", err });
  }
};

// Get most popular templates
export const getPopularTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .sort({ usageCount: -1 })
      .limit(5)
      .populate("components");
    
    res.status(200).json(templates);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch popular templates", err });
  }
};
