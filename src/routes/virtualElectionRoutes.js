const express = require("express");
const router = express.Router();
const virtualElectionController = require("../controllers/virtualElectionController");
const auth = require("../middleware/auth");

// Create a new election
router.post("/create", virtualElectionController.createElection);

// Get all elections
router.get("/", virtualElectionController.getAllElections);

// Get a specific election
router.get("/:id", virtualElectionController.getElectionById);

// Get candidates list for an election
router.get("/:electionId/candidates", virtualElectionController.getCandidatesByElection);

// Cast a vote (requires authentication)
router.post("/vote", auth, virtualElectionController.addVote);

// Get votes by election
router.get("/:electionId/votes", virtualElectionController.getVotesByElection);

module.exports = router;
