const db = require("../db")

module.exports = db.defineModel('candidate', {
    name: db.STRING(10),
    info: db.TEXT,
    vote_num: db.INTEGER(10),
    avater: db.TEXT
});