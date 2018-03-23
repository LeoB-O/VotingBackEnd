const model = require("../model");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;

module.exports = {
  "GET /test/:id": async (ctx, next) => {
    let code = ctx.request.query["code"];
    ctx.response.body = code;
  }
};
