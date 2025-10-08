const politicianService = require("../services/politicianService");

exports.createPolitician = async (req, res) => {
  try {
    const politician = await politicianService.createPolitician(req.body);
    res.status(201).json(politician);
  } catch (err) {
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
    const politician = await politicianService.updatePolitician(req.params.id, req.body);
    if (!politician) return res.status(404).json({ error: "Politician not found" });
    res.json(politician);
  } catch (err) {
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
