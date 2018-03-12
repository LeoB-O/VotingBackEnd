const model = require("../model");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;

function valid_token(token) {

}

function randomWord(randomFlag, min, max){
  var str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  // 随机产生
  if(randomFlag){
      range = Math.round(Math.random() * (max-min)) + min;
  }
  for(var i=0; i<range; i++){
      pos = Math.round(Math.random() * (arr.length-1));
      str += arr[pos];
  }
  return str;
}

module.exports = {
  "GET /api/votes": async (ctx, next) => {
    var rtn = {};
    rtn["success"] = true;
    var data = {};
    var temp_array = [];
    var temp_map = {};
    var candidate = await Candidate.findAll({
      attributes: ["id", "name", "info", "vote_num", "avater"]
    });
    var setting = await Setting.findAll({ attributes: ["key", "value"] });
    if (!candidate || !setting) {
      rtn["success"] = false;
      data["msg"] = "empty or db error";
    }
    for (let s of setting) {
      s = s.get({ plain: true });
      data[s["key"]] = s["value"];
    }
    for (let c of candidate) {
      var temp_map = {};
      temp_map["id"] = c["id"];
      temp_map["name"] = c["name"];
      temp_map["avater"] = c["avater"];
      temp_map["info"] = c["info"];
      temp_map["votes"] = c["vote_num"];
      temp_array.push(temp_map);
    }
    if (candidate) {
      data["candidates"] = temp_array;
    }
    rtn["data"] = data;
    ctx.response.body = rtn;
  },
  "GET /api/rank": async (ctx, next) => {
    var rtn = {};
    var data = [];
    var temp_array = [];
    rtn["success"] = true;
    var candidate = await Candidate.findAll({
      attributes: ["name", "vote_num"],
      order: "vote_num DESC"
    });
    if (!candidate) {
      rtn["success"] = false;
      rtn["data"]["msg"] = "empty or db error";
    }
    for (let c of candidate) {
      var temp_map = {};
      temp_map["name"] = c["name"];
      temp_map["votes"] = c["vote_num"];
      temp_array.push(temp_map);
    }
    if (candidate) {
      rtn["data"] = temp_array;
    }
    ctx.response.body = rtn;
  },
  "POST /api/vote": async (ctx, next) => {
    var id = ctx.request.body["id"];
    var ip = ctx.request.header["x-forwarded-for"];
    if (ip == null || ip.Length == 0 || !ip) {
      ip = ctx.request.header["Proxy-Client-IP"];
    }
    if (ip == null || ip.Length == 0 || !ip) {
      ip = ctx.request.header["WL-Proxy-Client-IP"];
    }
    if (ip == null || ip.Length == 0 || !ip) {
      ip = ctx.request.ip;
    }
    ip = ip
      .split(":")
      .pop()
      .split(",")
      .pop();
    if (!id) {
      var rtn = {};
      rtn["success"] = false;
      rtn["data"] = {};
      rtn["data"]["msg"] = "Params Error! Expect id!";
      ctx.response.body = rtn;
      return;
    }
    var candidate = await Candidate.find({ where: { id: id } });
    if (!candidate) {
      var rtn = {};
      rtn["success"] = false;
      rtn["data"] = {};
      rtn["data"]["msg"] = "id does not exist";
      ctx.response.body = rtn;
      return;
    }
    var vote_log = await Vote_log.find({
      where: {
        ip: ip
      },
      order: [["id", "DESC"]]
    });
    if (!vote_log) {
      let vote_to = [id];
      await Vote_log.create({
        ip: ip,
        vote_times: 1,
        vote_to: JSON.stringify(vote_to)
      });
    } else {
      var interval = Date.now() - vote_log["updated_at"];
      if (60 * 60 * 24 < interval) {
        let vote_to = [id];
        await Vote_log.create({
          ip: ip,
          vote_times: 1,
          vote_to: JSON.stringify(vote_to)
        });
      } else if (vote_log["vote_times"] >= 10) {
        var rtn = {};
        rtn["success"] = false;
        rtn["data"] = {};
        rtn["data"]["msg"] = "Reach Max vote times!";
        ctx.response.body = rtn;
        return;
      } else {
        let vote_to = JSON.parse(vote_log["vote_to"]);
        for (let c of vote_to) {
          if (c == id) {
            var rtn = {};
            rtn["success"] = false;
            rtn["data"] = {};
            rtn["data"]["msg"] = "Can't repeat vote to one person";
            ctx.response.body = rtn;
            return;
          }
        }
        vote_to.push(id);
        await Vote_log.update(
          {
            vote_times: vote_log["vote_times"] + 1,
            updated_at: Date.now(),
            vote_to: JSON.stringify(vote_to)
          },
          {
            where: {
              ip: ip,
              id: vote_log["id"]
            }
          }
        );
      }
    }
    candidate = candidate.get();
    var votes = candidate["vote_num"] + 1;
    await Candidate.update(
      {
        vote_num: votes,
        updated_at: Date.now()
      },
      {
        where: {
          id: id
        }
      }
    );
    var rtn = {};
    rtn["success"] = true;
    rtn["data"] = {};
    ctx.response.body = rtn;
  }
};
