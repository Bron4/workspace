const express = require('express');
const SmsMessage = require('../models/SmsMessage');
const City = require('../models/City');
const Technician = require('../models/Technician');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// GET /api/reports/cities - Get city performance report
router.get('/cities', requireUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('Fetching city performance report with params:', { startDate, endDate });

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Aggregate SMS messages by city
    const cityStats = await SmsMessage.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'cities',
          localField: 'cityId',
          foreignField: '_id',
          as: 'city'
        }
      },
      { $unwind: '$city' },
      {
        $group: {
          _id: '$cityId',
          city: { $first: '$city.name' },
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'sent'] }, 1, 0]
            }
          },
          failedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          city: 1,
          totalRequests: 1,
          failedRequests: 1,
          successRate: {
            $cond: [
              { $eq: ['$totalRequests', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$successfulRequests', '$totalRequests'] },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { city: 1 } }
    ]);

    console.log(`Found performance data for ${cityStats.length} cities`);

    // Format the response to match frontend expectations
    const formattedStats = cityStats.map(stat => ({
      city: stat.city,
      totalRequests: stat.totalRequests,
      successRate: Math.round(stat.successRate * 100) / 100, // Round to 2 decimal places
      failedRequests: stat.failedRequests
    }));

    res.json({ cityStats: formattedStats });
  } catch (error) {
    console.error('Error fetching city performance report:', error);
    res.status(500).json({
      error: 'Failed to fetch city performance report'
    });
  }
});

// GET /api/reports/technicians - Get technician performance report
router.get('/technicians', requireUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log('Fetching technician performance report with params:', { startDate, endDate });

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Aggregate SMS messages by technician
    const technicianStats = await SmsMessage.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'technicians',
          localField: 'technicianId',
          foreignField: '_id',
          as: 'technician'
        }
      },
      { $unwind: '$technician' },
      {
        $group: {
          _id: '$technicianId',
          technician: { $first: '$technician.name' },
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'sent'] }, 1, 0]
            }
          },
          failedRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          technician: 1,
          totalRequests: 1,
          failedRequests: 1,
          successRate: {
            $cond: [
              { $eq: ['$totalRequests', 0] },
              0,
              {
                $multiply: [
                  { $divide: ['$successfulRequests', '$totalRequests'] },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { technician: 1 } }
    ]);

    console.log(`Found performance data for ${technicianStats.length} technicians`);

    // Format the response to match frontend expectations
    const formattedStats = technicianStats.map(stat => ({
      technician: stat.technician,
      totalRequests: stat.totalRequests,
      successRate: Math.round(stat.successRate * 100) / 100, // Round to 2 decimal places
      failedRequests: stat.failedRequests
    }));

    res.json({ technicianStats: formattedStats });
  } catch (error) {
    console.error('Error fetching technician performance report:', error);
    res.status(500).json({
      error: 'Failed to fetch technician performance report'
    });
  }
});

// GET /api/reports/dashboard - Get dashboard analytics
router.get('/dashboard', requireUser, async (req, res) => {
  try {
    const { period } = req.query;
    console.log('Fetching dashboard analytics with period:', period);

    // Calculate date range based on period
    let startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      // Default to last 30 days
      startDate.setDate(startDate.getDate() - 30);
    }

    const dateFilter = {
      createdAt: { $gte: startDate }
    };

    // Get total statistics
    const totalStats = await SmsMessage.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          successfulRequests: {
            $sum: {
              $cond: [{ $eq: ['$status', 'sent'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Get counts of active cities and technicians
    const [activeCities, activeTechnicians] = await Promise.all([
      City.countDocuments({ isActive: true }),
      Technician.countDocuments({ isActive: true })
    ]);

    // Get recent activity (last 7 days)
    const recentActivityStart = new Date();
    recentActivityStart.setDate(recentActivityStart.getDate() - 7);

    const recentActivity = await SmsMessage.aggregate([
      {
        $match: {
          createdAt: { $gte: recentActivityStart }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          requests: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0 requests
    const activityMap = {};
    recentActivity.forEach(item => {
      activityMap[item._id] = item.requests;
    });

    const formattedActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      formattedActivity.push({
        date: dateStr,
        requests: activityMap[dateStr] || 0
      });
    }

    const stats = totalStats[0] || { totalRequests: 0, successfulRequests: 0 };
    const successRate = stats.totalRequests > 0 
      ? Math.round((stats.successfulRequests / stats.totalRequests) * 10000) / 100 
      : 0;

    console.log('Dashboard analytics calculated:', {
      totalRequests: stats.totalRequests,
      successRate,
      totalCities: activeCities,
      totalTechnicians: activeTechnicians
    });

    res.json({
      totalRequests: stats.totalRequests,
      successRate,
      totalTechnicians: activeTechnicians,
      totalCities: activeCities,
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard analytics'
    });
  }
});

module.exports = router;