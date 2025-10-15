const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Trip = sequelize.define('Trip', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  pickup_datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  dropoff_datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  passenger_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  pickup_longitude: {
    type: DataTypes.DECIMAL(12, 8),
    allowNull: true
  },
  pickup_latitude: {
    type: DataTypes.DECIMAL(12, 8),
    allowNull: true
  },
  dropoff_longitude: {
    type: DataTypes.DECIMAL(12, 8),
    allowNull: true
  },
  dropoff_latitude: {
    type: DataTypes.DECIMAL(12, 8),
    allowNull: true
  },
  store_and_fwd_flag: {
    type: DataTypes.STRING(1),
    allowNull: true
  },
  trip_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Trip duration in seconds'
  }
}, {
  tableName: 'trips',
  timestamps: false
});

module.exports = Trip;