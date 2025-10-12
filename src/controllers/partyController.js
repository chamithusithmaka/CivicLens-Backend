const partyService = require("../services/partyService");

exports.createParty = async (req, res) => {
  try {
    const party = await partyService.createParty(req.body);
    res.status(201).json(party);
  } catch (error) {
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
    const party = await partyService.updateParty(req.params.id, req.body);
    if (!party) return res.status(404).json({ error: "Party not found" });
    res.json(party);
  } catch (error) {
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