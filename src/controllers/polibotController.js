const Politician = require('../models/Politician');
const PromiseModel = require('../models/Promise');
const Party = require('../models/Party');
const Role = require('../models/Role');

/**
 * Get politician information for PoliBot
 */
exports.getPoliticianInfo = async (req, res) => {
  try {
    const { name } = req.params;
    
    // Case-insensitive search for politician by name
    const politician = await Politician.findOne({ 
      name: { $regex: new RegExp(name, 'i') } 
    })
    .populate('party')
    .populate('currentRole')
    .populate('roles');
    
    if (!politician) {
      return res.status(404).json({ error: 'Politician not found' });
    }
    
    // Get promises for this politician
    const promises = await PromiseModel.find({ 
      politicianID: politician._id.toString() 
    });
    
    // Calculate metrics
    const totalPromises = promises.length;
    const fulfilledPromises = promises.filter(p => p.promiseStatus === 'complete').length;
    const brokenPromises = promises.filter(p => p.promiseStatus === 'broken').length;
    const pendingPromises = promises.filter(p => p.promiseStatus === 'pending').length;
    
    // Calculate performance score
    const avgPerformanceScore = promises.length > 0 
      ? Math.round(promises.reduce((sum, p) => sum + p.performanceScore, 0) / promises.length) 
      : 0;
    
    // Get key achievements (completed promises)
    const achievements = promises
      .filter(p => p.promiseStatus === 'complete')
      .map(p => p.promiseTitle)
      .slice(0, 5);
    
    // Get controversies (broken promises)
    const controversies = promises
      .filter(p => p.promiseStatus === 'broken')
      .map(p => p.promiseTitle)
      .slice(0, 5);
    
    // Format response
    const response = {
      name: politician.name,
      party: politician.party ? politician.party.fullName : 'Unknown',
      partyAbbreviation: politician.party ? politician.party.abbreviation : 'Unknown',
      position: politician.currentRole ? politician.currentRole.title : 'Unknown',
      region: politician.region,
      yearsOfService: politician.yearsOfService,
      image: politician.image,
      achievements: [
        ...politician.achievements,
        ...achievements
      ],
      controversies: controversies,
      stats: {
        totalPromises,
        fulfilledPromises,
        brokenPromises,
        pendingPromises,
        performanceScore: avgPerformanceScore,
        fulfillmentRate: totalPromises > 0 ? Math.round((fulfilledPromises / totalPromises) * 100) : 0
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in getPoliticianInfo:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get party information for PoliBot
 */
exports.getPartyInfo = async (req, res) => {
  try {
    const { name } = req.params;
    
    // Case-insensitive search for party by name or abbreviation
    const party = await Party.findOne({
      $or: [
        { fullName: { $regex: new RegExp(name, 'i') } },
        { abbreviation: { $regex: new RegExp(name, 'i') } }
      ]
    });
    
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    
    // Find all politicians in this party
    const politicians = await Politician.find({ party: party._id })
      .populate('currentRole');
    
    // Get party leader (assume it's the politician with highest role level)
    const leader = politicians.length > 0 ? politicians[0].name : 'Unknown';
    
    // Get all promises from politicians in this party
    let allPromises = [];
    for (const politician of politicians) {
      const promises = await PromiseModel.find({ 
        politicianID: politician._id.toString() 
      });
      allPromises = [...allPromises, ...promises];
    }
    
    // Calculate party performance metrics
    const totalPromises = allPromises.length;
    const fulfilledPromises = allPromises.filter(p => p.promiseStatus === 'complete').length;
    const fulfillmentRate = totalPromises > 0 ? Math.round((fulfilledPromises / totalPromises) * 100) : 0;
    
    // Group promises by category to find key policies
    const categoryCounts = {};
    allPromises.forEach(promise => {
      if (!categoryCounts[promise.promiseCategory]) {
        categoryCounts[promise.promiseCategory] = 0;
      }
      categoryCounts[promise.promiseCategory]++;
    });
    
    // Get top 5 policy categories
    const keyPolicies = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category)
      .slice(0, 5);
    
    // Format response
    const response = {
      fullName: party.fullName,
      abbreviation: party.abbreviation,
      logo: party.logo,
      color: party.color,
      leader,
      memberCount: politicians.length,
      keyMembers: politicians.slice(0, 5).map(p => ({
        name: p.name,
        position: p.currentRole ? p.currentRole.title : 'Unknown'
      })),
      keyPolicies,
      stats: {
        totalPromises,
        fulfilledPromises,
        fulfillmentRate
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in getPartyInfo:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Compare politicians for PoliBot
 */
exports.comparePoliticians = async (req, res) => {
  try {
    const { name1, name2 } = req.params;
    
    // Find both politicians
    const politician1 = await Politician.findOne({ 
      name: { $regex: new RegExp(name1, 'i') } 
    }).populate('party').populate('currentRole');
    
    const politician2 = await Politician.findOne({ 
      name: { $regex: new RegExp(name2, 'i') } 
    }).populate('party').populate('currentRole');
    
    if (!politician1 || !politician2) {
      return res.status(404).json({ 
        error: 'One or both politicians not found',
        found1: !!politician1,
        found2: !!politician2
      });
    }
    
    // Get promises for both
    const promises1 = await PromiseModel.find({ 
      politicianID: politician1._id.toString() 
    });
    
    const promises2 = await PromiseModel.find({ 
      politicianID: politician2._id.toString() 
    });
    
    // Calculate metrics for politician 1
    const totalPromises1 = promises1.length;
    const fulfilledPromises1 = promises1.filter(p => p.promiseStatus === 'complete').length;
    const brokenPromises1 = promises1.filter(p => p.promiseStatus === 'broken').length;
    const pendingPromises1 = promises1.filter(p => p.promiseStatus === 'pending').length;
    const performanceScore1 = promises1.length > 0 
      ? Math.round(promises1.reduce((sum, p) => sum + p.performanceScore, 0) / promises1.length) 
      : 0;
    const fulfillmentRate1 = totalPromises1 > 0 ? Math.round((fulfilledPromises1 / totalPromises1) * 100) : 0;
    
    // Calculate metrics for politician 2
    const totalPromises2 = promises2.length;
    const fulfilledPromises2 = promises2.filter(p => p.promiseStatus === 'complete').length;
    const brokenPromises2 = promises2.filter(p => p.promiseStatus === 'broken').length;
    const pendingPromises2 = promises2.filter(p => p.promiseStatus === 'pending').length;
    const performanceScore2 = promises2.length > 0 
      ? Math.round(promises2.reduce((sum, p) => sum + p.performanceScore, 0) / promises2.length) 
      : 0;
    const fulfillmentRate2 = totalPromises2 > 0 ? Math.round((fulfilledPromises2 / totalPromises2) * 100) : 0;
    
    // Find common and different promise categories
    const categories1 = [...new Set(promises1.map(p => p.promiseCategory))];
    const categories2 = [...new Set(promises2.map(p => p.promiseCategory))];
    const commonCategories = categories1.filter(cat => categories2.includes(cat));
    
    // Format comparison response
    const response = {
      comparison: {
        politician1: {
          id: politician1._id,
          name: politician1.name,
          party: politician1.party ? politician1.party.fullName : 'Unknown',
          position: politician1.currentRole ? politician1.currentRole.title : 'Unknown',
          image: politician1.image,
          stats: {
            totalPromises: totalPromises1,
            fulfilledPromises: fulfilledPromises1,
            brokenPromises: brokenPromises1,
            pendingPromises: pendingPromises1,
            performanceScore: performanceScore1,
            fulfillmentRate: fulfillmentRate1
          }
        },
        politician2: {
          id: politician2._id,
          name: politician2.name,
          party: politician2.party ? politician2.party.fullName : 'Unknown',
          position: politician2.currentRole ? politician2.currentRole.title : 'Unknown',
          image: politician2.image,
          stats: {
            totalPromises: totalPromises2,
            fulfilledPromises: fulfilledPromises2,
            brokenPromises: brokenPromises2,
            pendingPromises: pendingPromises2,
            performanceScore: performanceScore2,
            fulfillmentRate: fulfillmentRate2
          }
        }
      },
      analysis: {
        commonFocus: commonCategories,
        performanceDifference: performanceScore1 - performanceScore2,
        fulfillmentDifference: fulfillmentRate1 - fulfillmentRate2
      }
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in comparePoliticians:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get policy area information
 */
exports.getPolicyAreaInfo = async (req, res) => {
  try {
    const { area } = req.params;
    
    // Find all promises in this policy area
    const promises = await PromiseModel.find({ 
      promiseCategory: { $regex: new RegExp(area, 'i') } 
    });
    
    if (promises.length === 0) {
      return res.status(404).json({ error: 'Policy area not found or has no promises' });
    }
    
    // Get all unique politician IDs
    const politicianIds = [...new Set(promises.map(p => p.politicianID))];
    
    // Find politicians who have made promises in this area
    const relatedPoliticians = await Promise.all(
      politicianIds.map(async id => {
        const politician = await Politician.findById(id)
          .populate('party')
          .populate('currentRole');
        
        if (!politician) return null;
        
        const politicianPromises = promises.filter(p => p.politicianID === id);
        const completedCount = politicianPromises.filter(p => p.promiseStatus === 'complete').length;
        const rate = politicianPromises.length > 0 
          ? Math.round((completedCount / politicianPromises.length) * 100) 
          : 0;
        
        return {
          id: politician._id,
          name: politician.name,
          party: politician.party ? politician.party.abbreviation : 'Unknown',
          position: politician.currentRole ? politician.currentRole.title : 'Unknown',
          promiseCount: politicianPromises.length,
          completionRate: rate
        };
      })
    );
    
    // Calculate area statistics
    const totalPromises = promises.length;
    const completedPromises = promises.filter(p => p.promiseStatus === 'complete').length;
    const brokenPromises = promises.filter(p => p.promiseStatus === 'broken').length;
    const pendingPromises = promises.filter(p => p.promiseStatus === 'pending').length;
    const avgCompletion = Math.round((completedPromises / totalPromises) * 100);
    
    // Format response
    const response = {
      area,
      description: `Policy area focusing on ${area} initiatives and development`,
      stats: {
        totalPromises,
        completedPromises,
        brokenPromises,
        pendingPromises,
        completionRate: avgCompletion
      },
      currentStatus: avgCompletion > 75 ? "Good progress" : avgCompletion > 40 ? "Moderate progress" : "Needs attention",
      keyPromises: promises
        .sort((a, b) => b.performanceScore - a.performanceScore)
        .slice(0, 3)
        .map(p => ({
          title: p.promiseTitle,
          politician: p.ministerName,
          status: p.promiseStatus,
          completionRate: p.promiseFulfillment
        })),
      relatedPoliticians: relatedPoliticians.filter(Boolean)
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in getPolicyAreaInfo:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Search for politicians, parties, or policy areas
 */
exports.search = async (req, res) => {
  try {
    const { query } = req.params;
    const searchRegex = new RegExp(query, 'i');
    
    // Search for politicians
    const politicians = await Politician.find({ 
      name: { $regex: searchRegex } 
    })
    .populate('party')
    .populate('currentRole')
    .limit(5);
    
    // Search for parties
    const parties = await Party.find({
      $or: [
        { fullName: { $regex: searchRegex } },
        { abbreviation: { $regex: searchRegex } }
      ]
    }).limit(5);
    
    // Search for promises by category (policy areas)
    const promises = await PromiseModel.find({
      promiseCategory: { $regex: searchRegex }
    });
    
    // Group promises by category to get policy areas
    const policyAreas = {};
    promises.forEach(promise => {
      if (!policyAreas[promise.promiseCategory]) {
        policyAreas[promise.promiseCategory] = {
          name: promise.promiseCategory,
          count: 0
        };
      }
      policyAreas[promise.promiseCategory].count++;
    });
    
    // Format response
    const response = {
      politicians: politicians.map(p => ({
        id: p._id,
        name: p.name,
        type: 'politician',
        party: p.party ? p.party.abbreviation : 'Unknown',
        position: p.currentRole ? p.currentRole.title : 'Unknown',
        image: p.image
      })),
      parties: parties.map(p => ({
        id: p._id,
        name: p.fullName,
        type: 'party',
        abbreviation: p.abbreviation,
        logo: p.logo
      })),
      policyAreas: Object.values(policyAreas).map(area => ({
        name: area.name,
        type: 'policy',
        promiseCount: area.count
      }))
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error in search:', err);
    res.status(500).json({ error: err.message });
  }
};