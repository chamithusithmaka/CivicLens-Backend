const VirtualElection = require("../models/VirtualElection");
const Vote = require("../models/Vote");

const virtualElectionService = {
  async createElection(data) {
    return await VirtualElection.create(data);
  },

  async getAllElections() {
    return await VirtualElection.find().populate("candidates.politician");
  },

  async getElectionById(id) {
    return await VirtualElection.findById(id).populate("candidates.politician");
  },

  async addVote(electionId, politicianId, voterId) {
    // prevent duplicate voting
    const existingVote = await Vote.findOne({ election: electionId, voterId });
    if (existingVote) throw new Error("You have already voted.");

    const vote = await Vote.create({ 
      election: electionId, 
      candidate: politicianId, 
      voterId 
    });

    // Increment vote count for the candidate in the election
    await VirtualElection.findOneAndUpdate(
      { _id: electionId, "candidates.politician": politicianId },
      { $inc: { "candidates.$.votes": 1, totalVotes: 1 } },
      { new: true }
    );

    return vote;
  },

  async getVotesByElection(electionId) {
    const election = await VirtualElection.findById(electionId).populate(
      "candidates.politician"
    );
    if (!election) throw new Error("Election not found");
    return election.candidates.map((c) => ({
      politician: c.politician.name,
      votes: c.votes,
    }));
  },

  async getCandidatesByElection(electionId) {
    const election = await VirtualElection.findById(electionId).populate({
      path: "candidates.politician",
      populate: { path: "party" }
    });
    
    if (!election) throw new Error("Election not found");
    
    return election.candidates.map((c) => ({
      _id: c.politician._id,
      name: c.politician.name,
      party: c.politician.party ? c.politician.party.fullName : "Independent",
      partyAbbreviation: c.politician.party ? c.politician.party.abbreviation : "",
      partyLogo: c.politician.party ? c.politician.party.logo : null,
      partyColor: c.politician.party ? c.politician.party.color : "#000000",
      img: c.politician.image || null,
      votes: c.votes,
      region: c.politician.region,
      yearsOfService: c.politician.yearsOfService
    }));
  },
};

module.exports = virtualElectionService;
