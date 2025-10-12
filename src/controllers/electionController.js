const mongoose = require('mongoose');
const Election = require('../models/election');
const notificationService = require('../services/notificationService');
const cron = require('node-cron');

// Get all elections with filtering
exports.getAllElections = async (req, res) => {
  try {
    const { electionType, status, isUpcoming, search, limit = 10, page = 1, sortBy = 'date', order = 'asc' } = req.query;
    
    // Build query
    const query = {};
    if (electionType) query.electionType = electionType;
    if (status) query.status = status;
    if (isUpcoming === 'true') query.isUpcoming = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'candidates.name': { $regex: search, $options: 'i' } },
        { 'candidates.party': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add active filter
    query.isActive = true;
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;
    
    // Query with pagination
    const elections = await Election.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip);
      
    // Get total count for pagination
    const total = await Election.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: elections.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: elections
    });
  } catch (error) {
    console.error('Error getting elections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch elections',
      error: error.message
    });
  }
};

// Get election by ID
exports.getElectionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid election ID format'
      });
    }
    
    const election = await Election.findById(id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: election
    });
  } catch (error) {
    console.error('Error getting election by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election',
      error: error.message
    });
  }
};

// Create new election
exports.createElection = async (req, res) => {
  try {
    const { 
      title, 
      electionType, 
      date, 
      description, 
      candidates, 
      provinces,
      voterTurnout,
      isUpcoming,
      facts,
      status 
    } = req.body;
    
    // Create election
    const election = new Election({
      title,
      electionType,
      date,
      description,
      candidates: candidates || [],
      provinces: provinces || [],
      voterTurnout: voterTurnout || 0,
      isUpcoming: isUpcoming || false,
      facts: facts || [],
      status: status || 'upcoming'
    });
    
    // Save election
    await election.save();
    
    // Send notification about new election
    if (isUpcoming) {
      await notificationService.sendNotificationBasedOnPreferences(
        'elections',
        null,
        'Upcoming Election',
        `New ${electionType} election: ${title}`,
        {
          type: 'election',
          electionId: election._id.toString(),
          electionType
        },
        election._id,
        'Election'
      );
      
      // Schedule daily election fact notifications
      scheduleElectionFactNotifications(election);
    }
    
    res.status(201).json({
      success: true,
      message: 'Election created successfully',
      data: election
    });
  } catch (error) {
    console.error('Error creating election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create election',
      error: error.message
    });
  }
};

// Update election
exports.updateElection = async (req, res) => {
  try {
    const { 
      title, 
      electionType, 
      date, 
      description, 
      candidates, 
      provinces,
      voterTurnout,
      isUpcoming,
      facts,
      status,
      isActive
    } = req.body;
    
    // Find election
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    // Update fields
    if (title !== undefined) election.title = title;
    if (electionType !== undefined) election.electionType = electionType;
    if (date !== undefined) election.date = date;
    if (description !== undefined) election.description = description;
    if (candidates !== undefined) election.candidates = candidates;
    if (provinces !== undefined) election.provinces = provinces;
    if (voterTurnout !== undefined) election.voterTurnout = voterTurnout;
    if (isUpcoming !== undefined) election.isUpcoming = isUpcoming;
    if (facts !== undefined) election.facts = facts;
    if (status !== undefined) election.status = status;
    if (isActive !== undefined) election.isActive = isActive;
    
    // Save updated election
    await election.save();
    
    // If status changed to completed, send notification
    if (status === 'completed' && election.status !== 'completed') {
      await notificationService.sendNotificationBasedOnPreferences(
        'elections',
        'electionResults',
        'Election Results',
        `Results for ${election.title} are now available`,
        {
          type: 'election',
          electionId: election._id.toString(),
          status: 'completed'
        },
        election._id,
        'Election'
      );
    }
    
    // If the date has changed and it's upcoming, reschedule fact notifications
    if (date && isUpcoming) {
      scheduleElectionFactNotifications(election);
    }
    
    res.status(200).json({
      success: true,
      message: 'Election updated successfully',
      data: election
    });
  } catch (error) {
    console.error('Error updating election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update election',
      error: error.message
    });
  }
};

// Delete election (soft delete)
exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    // Soft delete
    election.isActive = false;
    await election.save();
    
    res.status(200).json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete election',
      error: error.message
    });
  }
};

// Get upcoming elections
exports.getUpcomingElections = async (req, res) => {
  try {
    const upcomingElections = await Election.find({
      isUpcoming: true,
      isActive: true
    }).sort({ date: 1 });
    
    res.status(200).json({
      success: true,
      count: upcomingElections.length,
      data: upcomingElections
    });
  } catch (error) {
    console.error('Error getting upcoming elections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming elections',
      error: error.message
    });
  }
};

// Get past elections
exports.getPastElections = async (req, res) => {
  try {
    const { electionType, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = {
      isUpcoming: false,
      isActive: true
    };
    
    if (electionType) query.electionType = electionType;
    
    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const pastElections = await Election.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    // Get total count for pagination
    const total = await Election.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: pastElections.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: pastElections
    });
  } catch (error) {
    console.error('Error getting past elections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch past elections',
      error: error.message
    });
  }
};

// Get election facts
exports.getElectionFacts = async (req, res) => {
  try {
    const { electionId } = req.params;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    res.status(200).json({
      success: true,
      count: election.facts.length,
      data: election.facts
    });
  } catch (error) {
    console.error('Error getting election facts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election facts',
      error: error.message
    });
  }
};

// Add election fact
exports.addElectionFact = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { text, category } = req.body;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found'
      });
    }
    
    // Add fact
    election.facts.push({
      text,
      category
    });
    
    // Save updated election
    await election.save();
    
    res.status(200).json({
      success: true,
      message: 'Fact added successfully',
      data: election.facts
    });
  } catch (error) {
    console.error('Error adding election fact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add election fact',
      error: error.message
    });
  }
};

// Get countdown to next election
exports.getElectionCountdown = async (req, res) => {
  try {
    // Find the next upcoming election
    const nextElection = await Election.findOne({
      isUpcoming: true,
      isActive: true,
      date: { $gt: new Date() }
    }).sort({ date: 1 });
    
    if (!nextElection) {
      return res.status(404).json({
        success: false,
        message: 'No upcoming elections found'
      });
    }
    
    // Calculate countdown
    const now = new Date();
    const electionDate = new Date(nextElection.date);
    const timeRemaining = electionDate - now;
    
    // Calculate days, hours, minutes, seconds
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    res.status(200).json({
      success: true,
      data: {
        election: nextElection,
        countdown: {
          total: timeRemaining,
          days,
          hours,
          minutes,
          seconds
        }
      }
    });
  } catch (error) {
    console.error('Error getting election countdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch election countdown',
      error: error.message
    });
  }
};

// Helper function to schedule election fact notifications
const scheduleElectionFactNotifications = async (election) => {
  try {
    // Calculate days until election
    const now = new Date();
    const electionDate = new Date(election.date);
    const daysUntilElection = Math.ceil((electionDate - now) / (1000 * 60 * 60 * 24));
    
    console.log(`Scheduling election facts for ${election.title}. Days until election: ${daysUntilElection}`);
    
    // If there are facts and the election is in the future
    if (election.facts.length > 0 && daysUntilElection > 0) {
      // Determine how often to send facts based on days remaining and number of facts
      const factsPerDay = Math.min(1, Math.ceil(election.facts.length / daysUntilElection));
      
      console.log(`Will send ${factsPerDay} facts per day`);
      
      // Schedule daily fact at noon
      cron.schedule('0 12 * * *', async () => {
        try {
          // Check if election is still upcoming
          const currentElection = await Election.findById(election._id);
          if (!currentElection || !currentElection.isUpcoming || !currentElection.isActive) {
            console.log('Election is no longer upcoming or active. Stopping fact notifications.');
            return;
          }
          
          // Get random facts to send
          const availableFacts = currentElection.facts;
          if (availableFacts.length === 0) {
            console.log('No facts available for this election.');
            return;
          }
          
          // Choose random fact
          const randomIndex = Math.floor(Math.random() * availableFacts.length);
          const fact = availableFacts[randomIndex];
          
          // Send notification
          await notificationService.sendNotificationBasedOnPreferences(
            'elections',
            'electionFacts',
            'Election Fact',
            fact.text,
            {
              type: 'electionFact',
              electionId: currentElection._id.toString()
            },
            currentElection._id,
            'Election'
          );
          
          console.log(`Sent election fact: ${fact.text}`);
        } catch (error) {
          console.error('Error sending scheduled election fact:', error);
        }
      });
    }
  } catch (error) {
    console.error('Error scheduling election fact notifications:', error);
  }
};

// Initialize schedule for all upcoming elections
const initializeElectionFactSchedules = async () => {
  try {
    const upcomingElections = await Election.find({
      isUpcoming: true,
      isActive: true
    });
    
    console.log(`Initializing fact schedules for ${upcomingElections.length} upcoming elections`);
    
    upcomingElections.forEach(election => {
      scheduleElectionFactNotifications(election);
    });
  } catch (error) {
    console.error('Error initializing election fact schedules:', error);
  }
};

// Initialize schedules when the server starts
initializeElectionFactSchedules();