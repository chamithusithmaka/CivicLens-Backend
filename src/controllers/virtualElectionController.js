const virtualElectionService = require("../services/virtualElectionService");

const virtualElectionController = {
  async createElection(req, res) {
    try {
      // Map electionName to title if present (support both field names)
      const electionData = { ...req.body };
      if (electionData.electionName && !electionData.title) {
        electionData.title = electionData.electionName;
        delete electionData.electionName;
      }

      // Validate candidates array format
      if (electionData.candidates && Array.isArray(electionData.candidates)) {
        electionData.candidates = electionData.candidates.map(c => {
          if (typeof c === 'string') {
            // If candidate is just an ObjectId string, convert to { politician, votes: 0 }
            return { politician: c, votes: 0 };
          }
          // If already an object, ensure it has the correct structure
          return {
            politician: c.politician,
            votes: c.votes !== undefined ? c.votes : 0
          };
        });
      }

      const election = await virtualElectionService.createElection(electionData);
      res.status(201).json({ message: "Election created successfully", election });
    } catch (error) {
      console.error("Error creating virtual election:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async getAllElections(req, res) {
    try {
      const elections = await virtualElectionService.getAllElections();
      res.status(200).json(elections);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getElectionById(req, res) {
    try {
      const election = await virtualElectionService.getElectionById(req.params.id);
      if (!election) return res.status(404).json({ error: "Election not found" });
      res.status(200).json(election);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addVote(req, res) {
    try {
      // Get voterId from authenticated user token
      const voterId = req.user.userId;
      
      if (!voterId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const { electionId, politicianId } = req.body;
      
      // Validate required fields
      if (!electionId || !politicianId) {
        return res.status(400).json({ error: "electionId and politicianId are required" });
      }
      
      const vote = await virtualElectionService.addVote(electionId, politicianId, voterId);
      res.status(201).json({ message: "Vote recorded successfully", vote });
    } catch (error) {
      console.error("Error recording vote:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async getVotesByElection(req, res) {
    try {
      const votes = await virtualElectionService.getVotesByElection(req.params.electionId);
      res.status(200).json(votes);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getCandidatesByElection(req, res) {
    try {
      const candidates = await virtualElectionService.getCandidatesByElection(req.params.electionId);
      res.status(200).json({ candidates });
    } catch (error) {
      console.error("Error getting candidates:", error);
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = virtualElectionController;
