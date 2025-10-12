const Politician = require("../models/Politician");
const Role = require("../models/Role");

class PoliticianService {
  async createPolitician(data) {
    const politician = new Politician(data);
    return await politician.save();
  }

  async getAllPoliticians() {
    return await Politician.find()
      .populate("party")
      .populate("currentRole")
      .populate("roles");
      //.populate("electionRecords"); // Commented out until ElectionRecord model is created
  }
  
  async getPoliticiansByLevel(levelId) {
    // Find roles with the specified level
    const roles = await Role.find({ level: levelId });
    
    // Get role IDs
    const roleIds = roles.map(role => role._id);
    
    // Find politicians who either have the specified level as their current role
    // or have it in their roles array
    return await Politician.find({
      $or: [
        { currentRole: { $in: roleIds } },
        { roles: { $in: roleIds } }
      ]
    })
    .populate("party")
    .populate({
      path: "currentRole",
      populate: {
        path: "level"
      }
    })
    .populate({
      path: "roles",
      populate: {
        path: "level"
      }
    })
    //.populate("electionRecords");
  }

  async getPoliticianById(id) {
    return await Politician.findById(id)
      .populate("party")
      .populate("currentRole")
      .populate("roles");
      //.populate("electionRecords"); // Commented out until ElectionRecord model is created
  }

  async updatePolitician(id, data) {
    return await Politician.findByIdAndUpdate(id, data, { new: true });
  }

  async deletePolitician(id) {
    return await Politician.findByIdAndDelete(id);
  }

  async getPoliticiansCountByLevel(levelId) {
    // Find roles with the specified level
    const roles = await Role.find({ level: levelId });
    
    // Get role IDs
    const roleIds = roles.map(role => role._id);
    
    // Count politicians who either have the specified level as their current role
    // or have it in their roles array
    return await Politician.countDocuments({
      $or: [
        { currentRole: { $in: roleIds } },
        { roles: { $in: roleIds } }
      ]
    });
  }

  async getPoliticianRoles(politicianId) {
    const politician = await Politician.findById(politicianId)
      .populate({
        path: "currentRole",
        populate: {
          path: "level"
        }
      })
      .populate({
        path: "roles",
        populate: {
          path: "level"
        }
      });

    if (!politician) {
      throw new Error("Politician not found");
    }

    return {
      politicianId: politician._id,
      politicianName: politician.name,
      currentRole: politician.currentRole,
      historicalRoles: politician.roles,
      totalRoles: politician.roles ? politician.roles.length : 0
    };
  }

  async getPoliticianParty(politicianId) {
    const politician = await Politician.findById(politicianId)
      .populate("party");

    if (!politician) {
      throw new Error("Politician not found");
    }

    return {
      politicianId: politician._id,
      politicianName: politician.name,
      party: politician.party
    };
  }
}

module.exports = new PoliticianService();
