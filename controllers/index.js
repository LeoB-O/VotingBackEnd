const model = require("../model");
var request = require("sync-request");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;
const OPENID = model.OpenId;

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
    let data = {};
    if (!result["openid"]) {
      rtn["success"] = false;
      rtn["data"] = data;
    } else {
      const openid = result["openid"];
      try {
        const openidObj = await OPENID.find({
          where: { openid: openid }
        });
        if (!openidObj) {
          await OPENID.create({
                openid: openid,
                created_at: Date.now(),
                updated_at: Date.now()
          });
        } else {
            await OPENID.update(
                {
                    updated_at: Date.now()
                },
                {
                    where: {
                        openid: openid
                    }
                }
            );
        }
        var vote_log = await Vote_log.find({
          // where: { ip: ip, agent: agent },
          where: { openid: openid },
          order: [["id", "DESC"]]
        });
      } catch (err) {
        rtn["success"] = false;
        rtn["data"] = data;
        ctx.response.body = rtn;
        return;
      }
      if (!vote_log) {
        data["vote_to"] = [];
      } else {
        //let interval = Date.now() - vote_log["updated_at"];
        let today = new Date();
        let post_date = new Date(vote_log["updated_at"]);
        if (
          today.getDate() != post_date.getDate() ||
          today.getMonth() != post_date.getMonth()
        ) {
          data["vote_to"] = [];
        } else {
          const vote_to = JSON.parse(vote_log["vote_to"]);
          data["vote_to"] = vote_to;
        }
      }
      rtn["success"] = true;
      rtn["data"] = data;
      rtn["data"]["openid"] = openid;
    }
    // ctx.append("Access-Control-Allow-Origin", "*");
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
