const Politician = require("../models/Politician");

class PoliticianService {
  async createPolitician(data) {
    const politician = new Politician(data);
    return await politician.save();
  }

  async getAllPoliticians() {
    return await Politician.find()
      .populate("party")
      .populate("currentRole")
      .populate("roles")
      .populate("electionRecords");
  }

  async getPoliticianById(id) {
    return await Politician.findById(id)
      .populate("party")
      .populate("currentRole")
      .populate("roles")
      .populate("electionRecords");
  }

  async updatePolitician(id, data) {
    return await Politician.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePolitician(id) {
    return await Politician.findByIdAndDelete(id);
  }
}

module.exports = new PoliticianService();
