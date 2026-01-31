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
