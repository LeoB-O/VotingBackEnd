const model = require("../model");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;

module.exports = {
  "GET /test/:id": async (ctx, next) => {
    ctx.response.body = '<form method="POST" action="http://192.168.1.102:3000/api/vote"><input type="text" name="id"><button>submit</button></form>';
    
  }
};
