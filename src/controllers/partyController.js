const partyService = require("../services/partyService");
const { cloudinary } = require("../config/cloudinary");

// Helper function to get a value from a request body, checking for variations of the field name
function getBodyValue(body, fieldName) {
  // Check for field with exact name
  if (body[fieldName] !== undefined) {
    return body[fieldName];
  }
  
  // Check for field with tab character
  if (body[fieldName + '\t'] !== undefined) {
    return body[fieldName + '\t'];
  }
  
  // Check for field with whitespace
  for (const key in body) {
    if (key.trim() === fieldName) {
      return body[key];
    }
  }
  
  return undefined;
}

exports.createParty = async (req, res) => {
  try {
    console.log("Create party request body:", req.body);
    console.log("Create party file:", req.file);
    
    // Get sanitized field values
    const fullNameValue = getBodyValue(req.body, 'fullName');
    const abbreviationValue = getBodyValue(req.body, 'abbreviation');
    const colorValue = getBodyValue(req.body, 'color');
    const founderValue = getBodyValue(req.body, 'founder');
    
    // Check for required fields
    if (!fullNameValue) {
      return res.status(400).json({ error: "Full name is required" });
    }
    
    if (!abbreviationValue) {
      return res.status(400).json({ error: "Abbreviation is required" });
    }
    
    if (!colorValue) {
      return res.status(400).json({ error: "Color is required" });
    }
    
    // Create party data object
    const partyData = {
      fullName: fullNameValue.trim(),
      abbreviation: abbreviationValue.trim(),
      color: colorValue.trim(),
      founder: founderValue ? founderValue.trim() : undefined
    };
    
    // If a logo was uploaded, add the image URL to the party data
    if (req.file) {
      // For Cloudinary: use the path property (URL)
      if (req.file.path && req.file.path.includes('cloudinary')) {
        partyData.logo = req.file.path;
      } 
      // For disk storage: construct a URL
      else {
        partyData.logo = req.file.path || `/uploads/${req.file.filename}`;
      }
      console.log("Logo path set to:", partyData.logo);
    }
    
    const party = await partyService.createParty(partyData);
    res.status(201).json(party);
  } catch (error) {
    console.error("Error creating party:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllParties = async (req, res) => {
  try {
    const parties = await partyService.getAllParties();
    res.json(parties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPartyById = async (req, res) => {
  try {
    const party = await partyService.getPartyById(req.params.id);
    if (!party) return res.status(404).json({ error: "Party not found" });
    res.json(party);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateParty = async (req, res) => {
  try {
    console.log("Update party request body:", req.body);
    console.log("Update party file:", req.file);
    
    // Get sanitized field values
    const fullNameValue = getBodyValue(req.body, 'fullName');
    const abbreviationValue = getBodyValue(req.body, 'abbreviation');
    const colorValue = getBodyValue(req.body, 'color');
    const founderValue = getBodyValue(req.body, 'founder');
    
    // Create party data object with only the provided fields
    const partyData = {};
    if (fullNameValue) partyData.fullName = fullNameValue.trim();
    if (abbreviationValue) partyData.abbreviation = abbreviationValue.trim();
    if (colorValue) partyData.color = colorValue.trim();
    if (founderValue) partyData.founder = founderValue.trim();
    
    // If a logo was uploaded, add the image URL to the party data
    if (req.file) {
      // For Cloudinary: use the path property (URL)
      if (req.file.path && req.file.path.includes('cloudinary')) {
        partyData.logo = req.file.path;
      } 
      // For disk storage: construct a URL
      else {
        partyData.logo = req.file.path || `/uploads/${req.file.filename}`;
      }
      console.log("Logo path set to:", partyData.logo);
    }
    
    const party = await partyService.updateParty(req.params.id, partyData);
    if (!party) return res.status(404).json({ error: "Party not found" });
    res.json(party);
  } catch (error) {
    console.error("Error updating party:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const party = await partyService.deleteParty(req.params.id);
    if (!party) return res.status(404).json({ error: "Party not found" });
    res.json({ message: "Party deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload a logo for an existing party
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No logo image uploaded" });
    }
    
    const partyId = req.params.id;
    let logoUrl;
    
    // Handle image path based on storage type
    if (req.file.path && req.file.path.includes('cloudinary')) {
      logoUrl = req.file.path;
    } else {
      logoUrl = req.file.path || `/uploads/${req.file.filename}`;
    }
    
    console.log("Setting logo URL for party:", logoUrl);
    
    const party = await partyService.updateParty(partyId, { logo: logoUrl });
    
    if (!party) {
      return res.status(404).json({ error: "Party not found" });
    }
    
    res.json({ 
      message: "Logo uploaded successfully",
      party 
    });
  } catch (err) {
    console.error("Error uploading party logo:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get parties by founder
exports.getPartiesByFounder = async (req, res) => {
  try {
    const founder = req.params.founder;
    const parties = await partyService.getPartiesByFounder(founder);
    res.json(parties);
  } catch (error) {
    console.error("Error getting parties by founder:", error);
    res.status(500).json({ error: error.message });
  }
};