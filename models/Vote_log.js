const db = require("../db")

module.exports = db.defineModel('vote_log', {
    ip: {
        type: db.STRING(15),
        primaryKey: true
    },
    vote_to: {
        type:db.STRING(100),
        allowNull: true,
        defaultValue: '[]'
    },
    vote_times: db.INTEGER,
    agent: {
        type: db.TEXT,
        allowNull: true
    },
    openid: {
        type: db.STRING(255),
        allowNull: true
    }
});