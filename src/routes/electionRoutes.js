const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const auth = require('../middleware/auth');

// Get all elections with filtering
router.get('/', electionController.getAllElections);

// Get election by ID
router.get('/:id', electionController.getElectionById);

// Create new election (protected)
router.post('/', auth, electionController.createElection);

// Update election (protected)
router.put('/:id', auth, electionController.updateElection);

// Delete election (protected)
router.delete('/:id', auth, electionController.deleteElection);

// Get upcoming elections
router.get('/filter/upcoming', electionController.getUpcomingElections);

// Get past elections
router.get('/filter/past', electionController.getPastElections);

// Get election facts
router.get('/:electionId/facts', electionController.getElectionFacts);

// Add election fact (protected)
router.post('/:electionId/facts', auth, electionController.addElectionFact);

// Get countdown to next election
router.get('/countdown/next', electionController.getElectionCountdown);

module.exports = router;