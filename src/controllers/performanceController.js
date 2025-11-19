const Politician = require('../models/Politician');
const PromiseModel = require('../models/Promise');
const Party = require('../models/Party');
const Role = require('../models/Role');

// Get dashboard summary data for a specific politician
exports.getPoliticianDashboard = async (req, res) => {
  try {
    const { politicianId } = req.params;
    console.log('[DASHBOARD] Received politicianId:', politicianId);
    console.log('[DASHBOARD] politicianId type:', typeof politicianId);

    // Get politician details with populated references
    const politician = await Politician.findById(politicianId)
      .populate('party')
      .populate('currentRole')
      .populate('roles');

    if (!politician) {
      console.log('[DASHBOARD] Politician not found for id:', politicianId);
      return res.status(404).json({ error: 'Politician not found' });
    }

    console.log('[DASHBOARD] Found politician:', politician.name);

    // Debug: Check what politicianIDs exist in Promise collection
    const allPromises = await PromiseModel.find().limit(5);
    console.log('[DASHBOARD] Sample promise politicianIDs:', allPromises.map(p => ({ id: p.politicianID, type: typeof p.politicianID })));

    // Try both string and ObjectId versions
    const promisesAsString = await PromiseModel.find({ politicianID: politicianId.toString() });
    const promisesAsObjectId = await PromiseModel.find({ politicianID: politicianId });
    
    console.log('[DASHBOARD] Promises found with string query:', promisesAsString.length);
    console.log('[DASHBOARD] Promises found with ObjectId query:', promisesAsObjectId.length);

    // Use whichever query returns results
    const promises = promisesAsString.length > 0 ? promisesAsString : promisesAsObjectId;
    console.log('[DASHBOARD] Using promises:', promises.length);

    // If still no promises, check if any promises exist at all for debugging
    if (promises.length === 0) {
      const totalPromises = await PromiseModel.countDocuments();
      console.log('[DASHBOARD] Total promises in database:', totalPromises);
      
      // Check if politician._id matches any politicianID in promises
      const exactMatch = await PromiseModel.findOne({
        $or: [
          { politicianID: politicianId },
          { politicianID: politicianId.toString() },
          { politicianID: politician._id },
          { politicianID: politician._id.toString() }
        ]
      });
      console.log('[DASHBOARD] Found exact match:', !!exactMatch);
    }

    // Calculate performance metrics
    const totalPromises = promises.length;
    const fulfilledPromises = promises.filter(p => p.promiseStatus === 'complete').length;
    const brokenPromises = promises.filter(p => p.promiseStatus === 'broken').length;
    const pendingPromises = promises.filter(p => p.promiseStatus === 'pending').length;

    // Calculate average performance score
    const avgPerformanceScore = promises.length > 0
      ? promises.reduce((sum, p) => sum + (p.performanceScore || 0), 0) / promises.length
      : 0;

    // Calculate average public approval rating
    const avgPublicApproval = promises.length > 0
      ? promises.reduce((sum, p) => sum + (p.publicApprovalRating || 0), 0) / promises.length
      : 0;

    // Get quarterly performance data
    const quarterlyData = await getQuarterlyPerformance(politicianId);
    console.log('[DASHBOARD] Quarterly Data:', quarterlyData);

    // Get approval trend data
    const approvalData = await getApprovalTrend(politicianId);
    console.log('[DASHBOARD] Approval Data:', approvalData);

    // Get category performance data
    const categoryData = await getPerformanceByCategory(politicianId);
    console.log('[DASHBOARD] Category Data:', categoryData);

    // Get key promises (top 3 by performance score)
    const keyPromises = promises
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, 3);

    // Format key promises for dashboard
    const formattedKeyPromises = keyPromises.map(promise => ({
      id: promise._id,
      title: promise.promiseTitle,
      details: promise.promiseDetails,
      status: promise.promiseStatus,
      fulfillment: promise.promiseFulfillment,
      category: promise.promiseCategory
    }));

    console.log('[DASHBOARD] Final response - totalPromises:', totalPromises);

    // Return formatted dashboard data
    res.json({
      politician: {
        id: politician._id,
        name: politician.name,
        position: politician.currentRole ? politician.currentRole.title : 'Unknown',
        party: politician.party ? politician.party.fullName : 'Unknown',
        partyAbbreviation: politician.party ? politician.party.abbreviation : 'Unknown',
        partyColor: politician.party ? politician.party.color : '#000000',
        image: politician.image || '🧑‍💼',
      },
      performance: {
        score: Math.round(avgPerformanceScore),
        totalPromises,
        fulfilledPromises,
        brokenPromises,
        pendingPromises,
        fulfillmentRate: totalPromises > 0 ? (fulfilledPromises / totalPromises) * 100 : 0,
        publicApproval: Math.round(avgPublicApproval)
      },
      trends: {
        quarterly: quarterlyData,
        approval: approvalData,
        categories: categoryData
      },
      keyPromises: formattedKeyPromises,
      recentActivities: await getRecentActivities(politicianId)
    });
  } catch (err) {
    console.error('Error in getPoliticianDashboard:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get list of all politicians with basic performance data
exports.getAllPoliticianPerformance = async (req, res) => {
  try {
    const politicians = await Politician.find()
      .populate('party')
      .populate('currentRole');
    
    const results = await Promise.all(politicians.map(async (politician) => {
      // Get promises for this politician
      const promises = await PromiseModel.find({ politicianID: politician._id.toString() });
      
      // Calculate performance metrics
      const totalPromises = promises.length;
      const fulfilledPromises = promises.filter(p => p.promiseStatus === 'complete').length;
      
      // Calculate average performance score
      const avgPerformanceScore = promises.length > 0 
        ? promises.reduce((sum, p) => sum + p.performanceScore, 0) / promises.length 
        : 0;
      
      return {
        id: politician._id,
        name: politician.name,
        position: politician.currentRole ? politician.currentRole.title : 'Unknown',
        party: politician.party ? politician.party.fullName : 'Unknown',
        partyAbbreviation: politician.party ? politician.party.abbreviation : 'Unknown',
        image: politician.image || '🧑‍💼',
        score: Math.round(avgPerformanceScore),
        totalPromises,
        fulfilledPromises
      };
    }));
    
    res.json(results);
  } catch (err) {
    console.error('Error in getAllPoliticianPerformance:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get quarterly performance data - FIXED: Convert to string
async function getQuarterlyPerformance(politicianId) {
  // Try both string and ObjectId
  const promisesAsString = await PromiseModel.find({ politicianID: politicianId.toString() });
  const promisesAsObjectId = await PromiseModel.find({ politicianID: politicianId });
  const promises = promisesAsString.length > 0 ? promisesAsString : promisesAsObjectId;
  
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4', 'Now'];
  const quarterlyData = quarters.map(quarter => {
    const quarterPromises = promises.filter(promise => {
      if (quarter === 'Now') return true;
      if (!promise.startDate) return false;
      const date = new Date(promise.startDate);
      const promiseQuarter = Math.floor((date.getMonth()) / 3) + 1;
      return `Q${promiseQuarter}` === quarter;
    });
    const rating = quarterPromises.length > 0
      ? Math.round(quarterPromises.reduce((sum, p) => sum + (p.performanceScore || 0), 0) / quarterPromises.length)
      : 0;
    return { quarter, rating };
  });
  return quarterlyData;
}

async function getApprovalTrend(politicianId) {
  const promisesAsString = await PromiseModel.find({ politicianID: politicianId.toString() });
  const promisesAsObjectId = await PromiseModel.find({ politicianID: politicianId });
  const promises = promisesAsString.length > 0 ? promisesAsString : promisesAsObjectId;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map((month, index) => {
    const monthPromises = promises.filter((_, i) => i % months.length === index);
    const rating = monthPromises.length > 0
      ? Math.round(monthPromises.reduce((sum, p) => sum + (p.publicApprovalRating || 0), 0) / monthPromises.length)
      : 0;
    return { month, rating };
  });
}

async function getPerformanceByCategory(politicianId) {
  const promisesAsString = await PromiseModel.find({ politicianID: politicianId.toString() });
  const promisesAsObjectId = await PromiseModel.find({ politicianID: politicianId });
  const promises = promisesAsString.length > 0 ? promisesAsString : promisesAsObjectId;
  
  const categories = [...new Set(promises.map(p => p.promiseCategory).filter(Boolean))];
  return categories.map(category => {
    const categoryPromises = promises.filter(p => p.promiseCategory === category);
    const score = categoryPromises.length > 0
      ? Math.round(categoryPromises.reduce((sum, p) => sum + (p.performanceScore || 0), 0) / categoryPromises.length)
      : 0;
    return { category, score };
  });
}

// Dummy for recent activities (keep as is or implement as needed)
async function getRecentActivities(politicianId) {
  return [];
}

// Get performance by ministry
exports.getMinistryPerformance = async (req, res) => {
  try {
    // Group promises by ministry and calculate performance metrics
    const promises = await PromiseModel.find();
    
    // Group by ministry
    const ministryMap = {};
    
    promises.forEach(promise => {
      if (!ministryMap[promise.ministryName]) {
        ministryMap[promise.ministryName] = {
          ministry: promise.ministryName,
          totalPromises: 0,
          fulfilledPromises: 0,
          budget: 0,
          performance: 0
        };
      }
      
      const ministry = ministryMap[promise.ministryName];
      ministry.totalPromises++;
      if (promise.promiseStatus === 'complete') {
        ministry.fulfilledPromises++;
      }
      ministry.budget += promise.budgetAllocation;
      ministry.performance += promise.performanceScore;
    });
    
    // Calculate averages and format response
    const ministryPerformance = Object.values(ministryMap).map(ministry => ({
      ...ministry,
      utilization: ministry.totalPromises > 0 
        ? `${Math.round((ministry.fulfilledPromises / ministry.totalPromises) * 100)}%` 
        : '0%',
      budget: `$${(ministry.budget / 1000000).toFixed(1)}B`, // Format as $X.XB
      performance: ministry.totalPromises > 0 
        ? Math.round(ministry.performance / ministry.totalPromises) 
        : 0,
      status: getStatusLabel(ministry)
    }));
    
    res.json(ministryPerformance);
  } catch (err) {
    console.error('Error in getMinistryPerformance:', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper to determine status label based on performance
function getStatusLabel(ministry) {
  const utilizationRate = ministry.totalPromises > 0 
    ? (ministry.fulfilledPromises / ministry.totalPromises) * 100 
    : 0;
  
  if (utilizationRate >= 85) return 'On Track';
  if (utilizationRate >= 70) return 'At Risk';
  return 'Needs Improvement';
}

// Get promise comparison for politicians - FIXED: Convert to string
exports.comparePromisesById = async (req, res) => {
  try {
    const { politicianIds } = req.body; // Array of politician IDs to compare
    
    if (!politicianIds || !Array.isArray(politicianIds) || politicianIds.length < 2) {
      return res.status(400).json({ error: 'Please provide at least two politician IDs to compare' });
    }
    
    const comparisonData = await Promise.all(politicianIds.map(async (id) => {
      const politician = await Politician.findById(id)
        .populate('party')
        .populate('currentRole');
      
      if (!politician) {
        return null;
      }
      
      const promises = await PromiseModel.find({ politicianID: id.toString() });
      
      return {
        id: politician._id,
        name: politician.name,
        position: politician.currentRole ? politician.currentRole.title : 'Unknown',
        party: politician.party ? politician.party.fullName : 'Unknown',
        image: politician.image || '🧑‍💼',
        performanceScore: promises.length > 0 
          ? Math.round(promises.reduce((sum, p) => sum + p.performanceScore, 0) / promises.length) 
          : 0,
        totalPromises: promises.length,
        fulfilledPromises: promises.filter(p => p.promiseStatus === 'complete').length,
        brokenPromises: promises.filter(p => p.promiseStatus === 'broken').length,
        pendingPromises: promises.filter(p => p.promiseStatus === 'pending').length,
        publicApproval: promises.length > 0 
          ? Math.round(promises.reduce((sum, p) => sum + p.publicApprovalRating, 0) / promises.length) 
          : 0
      };
    }));
    
    // Filter out null values (politicians not found)
    const validData = comparisonData.filter(Boolean);
    
    res.json(validData);
  } catch (err) {
    console.error('Error in comparePromisesById:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get party performance
exports.getPartyPerformance = async (req, res) => {
  try {
    const parties = await Party.find();
    
    const partyPerformance = await Promise.all(parties.map(async (party) => {
      // Get all politicians from this party
      const politicians = await Politician.find({ party: party._id });
      
      let totalPromises = 0;
      let fulfilledPromises = 0;
      let totalPerformance = 0;
      
      // Calculate aggregated metrics
      await Promise.all(politicians.map(async (politician) => {
        const promises = await PromiseModel.find({ politicianID: politician._id.toString() });
        
        totalPromises += promises.length;
        fulfilledPromises += promises.filter(p => p.promiseStatus === 'complete').length;
        totalPerformance += promises.reduce((sum, p) => sum + p.performanceScore, 0);
      }));
      
      return {
        id: party._id,
        name: party.fullName,
        abbreviation: party.abbreviation,
        color: party.color,
        logo: party.logo,
        politicianCount: politicians.length,
        totalPromises,
        fulfilledPromises,
        fulfillmentRate: totalPromises > 0 ? (fulfilledPromises / totalPromises) * 100 : 0,
        averagePerformance: totalPromises > 0 ? totalPerformance / totalPromises : 0
      };
    }));
    
    res.json(partyPerformance);
  } catch (err) {
    console.error('Error in getPartyPerformance:', err);
    res.status(500).json({ error: err.message });
  }
};