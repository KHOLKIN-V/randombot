const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'tg_bot_marinad', 
    'root', 
    'root', 
    {
        host: '5.188.76.50',
        port: '6432',
        dialect: 'postgres'
    }
)