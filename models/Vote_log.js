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
    vote_times: db.INTEGER
});