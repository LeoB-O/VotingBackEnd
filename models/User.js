const db = require("../db")


module.exports = db.defineModel('user', {
    user_name: {
        type: db.STRING(20),
        primaryKey: true
    },
    password: db.CHAR(32),
    permission: db.INTEGER
});