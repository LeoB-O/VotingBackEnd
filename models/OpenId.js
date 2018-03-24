const db = require("../db");

module.exports = db.defineModel('openids', {
    openid: {
        type: db.STRING(255),
    },
});