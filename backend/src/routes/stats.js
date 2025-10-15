const express = require('express');
const { Trip, sequelize } = require('../models');
const { Op, fn, col } = require('sequelize');
const router = express.Router();

// Helper function to convert date format
function parseDate(dateString) {
  if (!dateString) return null;
  
  // Handle MM/DD/YYYY format
  if (dateString.includes('/')) {
    const [month, day, year] = dateString.split('/');
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  }
  
  // Handle YYYY-MM-DD format
  return new Date(dateString);
}

// Get dashboard statistics and chart data
router.get('/', async (req, res) => {
  try {
    const { vendor_id, passenger_count, start_date, end_date } = req.query;
    
    // Build where clause for filters
    const whereClause = {};
    
    if (vendor_id && vendor_id !== 'all') {
      whereClause.vendor_id = parseInt(vendor_id);
    }
    
    if (passenger_count && passenger_count !== 'all') {
      if (passenger_count === '3') {
        whereClause.passenger_count = { [Op.gte]: 3 };
      } else {
        whereClause.passenger_count = parseInt(passenger_count);
      }
    }
    
    if (start_date && end_date) {
      const startDate = parseDate(start_date);
      const endDate = parseDate(end_date);
      
      if (startDate && endDate) {
        whereClause.pickup_datetime = {
          [Op.between]: [startDate, new Date(endDate.getTime() + 24 * 60 * 60 * 1000)]
        };
      }
    }
    
    // Get basic statistics
    const totalTrips = await Trip.count({ where: whereClause });
    
    const avgPassengers = await Trip.findOne({
      where: whereClause,
      attributes: [[fn('AVG', col('passenger_count')), 'avg']]
    });
    
    const durationStats = await Trip.findOne({
      where: whereClause,
      attributes: [
        [fn('AVG', col('trip_duration')), 'avg_duration'],
        [fn('MAX', col('trip_duration')), 'max_duration']
      ]
    });
    
    // Get vendor distribution
    const vendorDistribution = await Trip.findAll({
      where: whereClause,
      attributes: [
        'vendor_id',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['vendor_id'],
      raw: true
    });
    
    // Get passenger distribution
    const passengerDistribution = await Trip.findAll({
      where: whereClause,
      attributes: [
        'passenger_count',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['passenger_count'],
      order: [['passenger_count', 'ASC']],
      raw: true
    });
    
    // Get duration distribution
    const durationDistribution = await getDurationDistribution(whereClause);
    
    // Get hourly distribution
    const hourlyDistribution = await getHourlyDistribution(whereClause);
    
    res.json({
      success: true,
      totalTrips,
      avgPassengers: parseFloat(avgPassengers?.dataValues?.avg || 0).toFixed(1),
      avgDuration: Math.floor(parseInt(durationStats?.dataValues?.avg_duration || 0) / 60),
      longestTrip: Math.floor(parseInt(durationStats?.dataValues?.max_duration || 0) / 60),
      vendorDistribution: formatVendorData(vendorDistribution),
      passengerDistribution: formatPassengerData(passengerDistribution),
      durationDistribution: durationDistribution,
      hourlyDistribution: hourlyDistribution
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Helper function for duration distribution
async function getDurationDistribution(whereClause) {
  try {
    const shortTrips = await Trip.count({
      where: {
        ...whereClause,
        trip_duration: { [Op.lt]: 600 } // < 10 minutes
      }
    });
    
    const mediumTrips = await Trip.count({
      where: {
        ...whereClause,
        trip_duration: { 
          [Op.and]: [
            { [Op.gte]: 600 },   // >= 10 minutes
            { [Op.lt]: 1800 }    // < 30 minutes
          ]
        }
      }
    });
    
    const longTrips = await Trip.count({
      where: {
        ...whereClause,
        trip_duration: { [Op.gte]: 1800 } // >= 30 minutes
      }
    });
    
    return {
      short: shortTrips,
      medium: mediumTrips,
      long: longTrips
    };
  } catch (error) {
    console.error('Error getting duration distribution:', error);
    return { short: 0, medium: 0, long: 0 };
  }
}

// Helper function for hourly distribution
async function getHourlyDistribution(whereClause) {
  try {
    const hourlyData = await Trip.findAll({
      where: whereClause,
      attributes: [
        [fn('HOUR', col('pickup_datetime')), 'hour'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('HOUR', col('pickup_datetime'))],
      order: [[fn('HOUR', col('pickup_datetime')), 'ASC']],
      raw: true
    });
    
    // Create array for 24 hours
    const hourlyDistribution = Array(24).fill(0);
    
    hourlyData.forEach(item => {
      const hour = parseInt(item.hour);
      if (hour >= 0 && hour < 24) {
        hourlyDistribution[hour] = parseInt(item.count);
      }
    });
    
    return hourlyDistribution;
  } catch (error) {
    console.error('Error getting hourly distribution:', error);
    return Array(24).fill(0);
  }
}

// Helper function to format vendor data
function formatVendorData(vendorData) {
  const result = { 1: 0, 2: 0 };
  vendorData.forEach(item => {
    const vendorId = item.vendor_id;
    const count = parseInt(item.count);
    if (vendorId === 1 || vendorId === 2) {
      result[vendorId] = count;
    }
  });
  return result;
}

// Helper function to format passenger data
function formatPassengerData(passengerData) {
  const result = { 1: 0, 2: 0, 3: 0, 4: 0, "5+": 0 };
  
  passengerData.forEach(item => {
    const passengerCount = item.passenger_count;
    const count = parseInt(item.count);
    
    if (passengerCount >= 1 && passengerCount <= 4) {
      result[passengerCount] = count;
    } else if (passengerCount >= 5) {
      result["5+"] += count;
    }
  });
  
  return result;
}

module.exports = router;