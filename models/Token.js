const db = require("../db")

module.exports = db.defineModel('token', {
    token: db.TEXT,
    user_name: db.STRING(20)
});