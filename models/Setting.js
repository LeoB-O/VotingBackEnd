const db = require("../db");

module.exports = db.defineModel('setting', {
    key: db.TEXT,
    value: {
        type: db.TEXT,
        allowNull: true
    },
    activated: {
        type: db.INTEGER,
        allowNull: true
    }
});