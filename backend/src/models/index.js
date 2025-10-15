const sequelize = require('../config/database');
const Trip = require('./Trip');

const models = {
  Trip,
  sequelize
};

module.exports = models;