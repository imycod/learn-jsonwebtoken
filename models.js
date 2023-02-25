const {Sequelize} = require('sequelize')
const db = require('./config/db.js')
const { database, username, password, ...options } = db.development.databases
const sequelize = new Sequelize(database, username, password, options)

const initModels = require('./models/init-models.js')
const Model=initModels(sequelize)

module.exports={
    sequelize,
    Model,
}
