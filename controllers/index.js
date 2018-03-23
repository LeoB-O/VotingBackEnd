const model = require("../model");
var request = require("sync-request");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;

module.exports = {
  "GET /test/": async (ctx, next) => {
    let code = ctx.request.query["code"];
    ctx.response.body = code;
  },
  "GET /api/open": async (ctx, next) => {
    let code = ctx.request.query["code"];
    let content = "";
    var res = request(
      "GET",
      "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx8429772cb48a758b&secret=7d0da3c170f0d6da7c170a2c2a7b387d&code=" +
        code +
        "&grant_type=authorization_code"
    );
    //console.log(res.getBody());
    result = res.getBody("utf-8");
    result = JSON.parse(result);
    console.log(result);
    let rtn = {};
    if (!result["openid"]) {
      rtn["success"] = false;
    } else {
      rtn["success"] = true;
    }
    rtn["data"] = {};
    rtn["data"]["openid"] = result["openid"];
    ctx.response.body = rtn;

    // http.get(
    //   "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx4ecfd46285ce635f&secret=e7924b7afb5fad3dec368bef775f2d15&code=" +
    //     code +
    //     "&grant_type=authorization_code",
    //   function(req, res) {
    //     let html = "";
    //     req.on("data", data => {
    //       html += data;
    //     });
    //     req.on("end", () => {
    //       console.log(html);
    //     });
    //   }
    // );
  }
};
