import Security from "../models/security.js";

// Update security protections
export const updateSecurity = async (req, res) => {
  try {
    const { designId, activeProtections, detectedAttacks } = req.body;

    let security = await Security.findOne({ designId });
    if (!security) {
      security = new Security({ designId, activeProtections, detectedAttacks });
    } else {
      security.activeProtections = activeProtections;
      security.detectedAttacks = detectedAttacks;
    }

    await security.save();
    res.status(200).json(security);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get security for a design
export const getSecurity = async (req, res) => {
  try {
    const security = await Security.findOne({ designId: req.params.designId });
    res.status(200).json(security);
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
