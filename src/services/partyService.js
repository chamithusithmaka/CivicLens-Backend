// services/partyService.js
const Party = require("../models/Party");

class PartyService {
  async createParty(data) {
    const party = new Party(data);
    return await party.save();
  }

  async getAllParties() {
    return await Party.find();
  }

  async getPartyById(id) {
    return await Party.findById(id);
  }

  async updateParty(id, data) {
    return await Party.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteParty(id) {
    return await Party.findByIdAndDelete(id);
  }

  async getPartiesByFounder(founder) {
    return await Party.find({ founder: new RegExp(founder, 'i') }); // Case-insensitive search
  }
}

module.exports = new PartyService();
