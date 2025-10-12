const politicianService = require("../services/politicianService");
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

exports.createPolitician = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File:", req.file);
    
    // Get sanitized field values using our helper
    const nameValue = getBodyValue(req.body, 'name');
    const partyValue = getBodyValue(req.body, 'party');
    const dateOfBirthValue = getBodyValue(req.body, 'dateOfBirth');
    const regionValue = getBodyValue(req.body, 'region');
    const yearsOfServiceValue = getBodyValue(req.body, 'yearsOfService');
    const currentRoleValue = getBodyValue(req.body, 'currentRole');
    const rolesValue = getBodyValue(req.body, 'roles');
    const achievementsValue = getBodyValue(req.body, 'achievements');
    
    // Check if required fields are present
    if (!nameValue) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    if (!partyValue) {
      return res.status(400).json({ error: "Party is required" });
    }
    
    // Create a new object for the politician data
    const politicianData = {
      name: nameValue.trim(), // trim to remove any whitespace or tabs
      dateOfBirth: dateOfBirthValue,
      region: regionValue,
      yearsOfService: yearsOfServiceValue ? Number(yearsOfServiceValue) : undefined,
      party: partyValue,
      currentRole: currentRoleValue,
      achievements: achievementsValue ? achievementsValue.split(',').map(item => item.trim()) : []
    };

    // Handle roles array
    if (rolesValue) {
      if (typeof rolesValue === 'string') {
        politicianData.roles = rolesValue.split(',').map(id => id.trim());
      } else {
        politicianData.roles = rolesValue;
      }
    }
    
    // If an image was uploaded, add the image URL to the politician data
    if (req.file) {
      // For Cloudinary: use the path property (URL)
      if (req.file.path && req.file.path.includes('cloudinary')) {
        politicianData.image = req.file.path;
      } 
      // For disk storage: construct a URL
      else {
        politicianData.image = req.file.path || `/uploads/${req.file.filename}`;
      }
      console.log("Image path set to:", politicianData.image);
    }
    
    console.log('Creating politician with data:', politicianData);
    
    const politician = await politicianService.createPolitician(politicianData);
    res.status(201).json(politician);
  } catch (err) {
    console.error('Error creating politician:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPoliticians = async (req, res) => {
  try {
    const politicians = await politicianService.getAllPoliticians();
    res.json(politicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPoliticianById = async (req, res) => {
  try {
    const politician = await politicianService.getPoliticianById(req.params.id);
    if (!politician) return res.status(404).json({ error: "Politician not found" });
    res.json(politician);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePolitician = async (req, res) => {
  try {
    console.log("Update politician request body:", req.body);
    console.log("Update politician file:", req.file);
    
    // Create a new object for the politician data
    const politicianData = {};
    
    // Get sanitized field values
    const nameValue = getBodyValue(req.body, 'name');
    const dateOfBirthValue = getBodyValue(req.body, 'dateOfBirth');
    const regionValue = getBodyValue(req.body, 'region');
    const yearsOfServiceValue = getBodyValue(req.body, 'yearsOfService');
    const partyValue = getBodyValue(req.body, 'party');
    const currentRoleValue = getBodyValue(req.body, 'currentRole');
    const achievementsValue = getBodyValue(req.body, 'achievements');
    const rolesValue = getBodyValue(req.body, 'roles');
    
    // Only add fields that are present in the request body
    if (nameValue) politicianData.name = nameValue.trim();
    if (dateOfBirthValue) politicianData.dateOfBirth = dateOfBirthValue;
    if (regionValue) politicianData.region = regionValue;
    if (yearsOfServiceValue) politicianData.yearsOfService = Number(yearsOfServiceValue);
    if (partyValue) politicianData.party = partyValue;
    if (currentRoleValue) politicianData.currentRole = currentRoleValue;
    
    // Handle arrays
    if (achievementsValue) {
      politicianData.achievements = typeof achievementsValue === 'string' 
        ? achievementsValue.split(',').map(item => item.trim()) 
        : achievementsValue;
    }
    
    if (rolesValue) {
      politicianData.roles = typeof rolesValue === 'string' 
        ? rolesValue.split(',').map(id => id.trim()) 
        : rolesValue;
    }
    
    // If an image was uploaded with the update request, add the image URL to the politician data
    if (req.file) {
      // For Cloudinary: use the path property (URL)
      if (req.file.path && req.file.path.includes('cloudinary')) {
        politicianData.image = req.file.path;
      } 
      // For disk storage: construct a URL
      else {
        politicianData.image = req.file.path || `/uploads/${req.file.filename}`;
      }
      console.log("Image path set to:", politicianData.image);
    }
    
    console.log('Updating politician with data:', politicianData);
    
    const politician = await politicianService.updatePolitician(req.params.id, politicianData);
    if (!politician) return res.status(404).json({ error: "Politician not found" });
    res.json(politician);
  } catch (err) {
    console.error('Error updating politician:', err);
    res.status(400).json({ error: err.message });
  }
};

exports.deletePolitician = async (req, res) => {
  try {
    const politician = await politicianService.deletePolitician(req.params.id);
    if (!politician) return res.status(404).json({ error: "Politician not found" });
    res.json({ message: "Politician deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPoliticiansByLevel = async (req, res) => {
  try {
    const levelId = req.params.levelId;
    const politicians = await politicianService.getPoliticiansByLevel(levelId);
    res.json(politicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload an image for an existing politician
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    
    const politicianId = req.params.id;
    let imageUrl;
    
    // Handle image path based on storage type
    if (req.file.path && req.file.path.includes('cloudinary')) {
      imageUrl = req.file.path;
    } else {
      imageUrl = req.file.path || `/uploads/${req.file.filename}`;
    }
    
    console.log("Setting image URL for politician:", imageUrl);
    
    const politician = await politicianService.updatePolitician(politicianId, { image: imageUrl });
    
    if (!politician) {
      return res.status(404).json({ error: "Politician not found" });
    }
    
    res.json({ 
      message: "Image uploaded successfully",
      politician 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
