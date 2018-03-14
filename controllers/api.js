const model = require("../model");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;

function getError(err) {
  let rtn = {};
  let data = {};
  data["msg"] = err.message;
  rtn["data"] = data;
  return rtn;
}

function getUTC(time_str) {
  var year_pos = time_str.indexOf("年");
  var mon_pos = time_str.indexOf("月");
  var day_pos = time_str.indexOf("日");
  var sp_pos = time_str.indexOf(" ");
  var co_pos = time_str.indexOf(":");
  var year = time_str.substring(0, year_pos);
  var mon = time_str.substring(year_pos + 1, mon_pos);
  var day = time_str.substring(mon_pos + 1, day_pos);
  var hour = time_str.substring(sp_pos + 1, co_pos);
  var minute = time_str.substring(co_pos + 1);
  var utc = Date.UTC(year, mon - 1, day, hour, minute, 0, 0);
  return utc;
}

module.exports = {
  "GET /api/votes": async (ctx, next) => {
    let rtn = {};
    let data = {};
    let temp_array = [];
    try {
      var candidate = await Candidate.findAll({
        attributes: ["id", "name", "info", "vote_num", "avater"]
      });
      var setting = await Setting.findAll({ attributes: ["key", "value"] });
    } catch (err) {
      rtn = getError(err);
      ctx.response.body = rtn;
      return;
    }
    if (!candidate || !setting) {
      rtn["success"] = false;
      data["msg"] = "empty or db error";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    for (let s of setting) {
      s = s.get({ plain: true });
      data[s["key"]] = s["value"];
    }
    for (let c of candidate) {
      let temp_map = {};
      temp_map["id"] = c["id"];
      temp_map["name"] = c["name"];
      temp_map["avater"] = c["avater"];
      temp_map["info"] = c["info"];
      temp_map["votes"] = c["vote_num"];
      temp_array.push(temp_map);
    }
    data["candidates"] = temp_array;
    rtn["success"] = true;
    rtn["data"] = data;
    ctx.response.body = rtn;
  },
  "GET /api/rank": async (ctx, next) => {
    let rtn = {};
    let data = [];
    let temp_array = [];
    try {
      var candidate = await Candidate.findAll({
        attributes: ["name", "vote_num"],
        order: "vote_num DESC"
      });
    } catch (err) {
      rtn = getError(err);
      ctx.response.body = rtn;
      return;
    }
    if (!candidate) {
      rtn["success"] = false;
      rtn["data"]["msg"] = "empty or db error";
      ctx.response.body = rtn;
      return;
    }
    for (let c of candidate) {
      let temp_map = {};
      temp_map["name"] = c["name"];
      temp_map["votes"] = c["vote_num"];
      temp_array.push(temp_map);
    }
    rtn["success"] = true;
    rtn["data"] = temp_array;
    ctx.response.body = rtn;
  },
  "POST /api/vote": async (ctx, next) => {
    let rtn = {};
    rtn["data"] = {};
    try {
      let starttime = await Setting.find({ where: { key: "beginTime" } });
      let endtime = await Setting.find({ where: { key: "endTime" } });
      starttime = getUTC(starttime["value"]);
      endtime = getUTC(endtime["value"]);
      let now = Date.now();
      if (now < starttime || now > endtime) {
        rtn["data"]["msg"] = "not vote time";
        rtn["data"]["errorcode"] = 400;
        ctx.response.body = rtn;
        return;
      }
    } catch (err) {
      rtn["data"]["msg"] = err.message;
      rtn["data"]["errorcode"] = 500;
      ctx.response.body = rtn;
      return;
    }

    let id = ctx.request.body["id"];
    let ip = ctx.request.header["x-forwarded-for"];
    if (!ip || ip.Length == 0) {
      ip = ctx.request.header["Proxy-Client-IP"];
    }
    if (!ip || ip.Length == 0) {
      ip = ctx.request.header["WL-Proxy-Client-IP"];
    }
    if (!ip || ip.Length == 0) {
      ip = ctx.request.ip;
    }
    ip = ip
      .split(":")
      .pop()
      .split(",")
      .pop();
    if (!id) {
      rtn = {};
      rtn["success"] = false;
      rtn["data"] = {};
      rtn["data"]["msg"] = "Params Error! Expect id!";
      ctx.response.body = rtn;
      return;
    }
    try {
      var candidate = await Candidate.find({ where: { id: id } });
    } catch (err) {
      let rtn = getError(err);
      ctx.response.body = rtn;
      return;
    }
    if (!candidate) {
      let rtn = {};
      rtn["success"] = false;
      rtn["data"] = {};
      rtn["data"]["msg"] = "id does not exist";
      ctx.response.body = rtn;
      return;
    }
    try {
      var vote_log = await Vote_log.find({
        where: { ip: ip },
        order: [["id", "DESC"]]
      });
    } catch (err) {
      let rtn = getError(err);
      ctx.response.body = rtn;
      return;
    }
    if (!vote_log) {
      let vote_to = [id];
      try {
        rtn["data"] = {};
        rtn["data"]["vote_to"] = vote_to;
        await Vote_log.create({
          ip: ip,
          vote_times: 1,
          vote_to: JSON.stringify(vote_to)
        });
      } catch (err) {
        let rtn = getError(err);
        ctx.response.body = rtn;
        return;
      }
    } else {
      let interval = Date.now() - vote_log["updated_at"];
      if (60 * 60 * 24 * 1000 < interval) {
        let vote_to = [id];
        try {
          rtn["data"] = {};
          rtn["data"]["vote_to"] = vote_to;
          await Vote_log.create({
            ip: ip,
            vote_times: 1,
            vote_to: JSON.stringify(vote_to)
          });
        } catch (err) {
          let rtn = getError(err);
          ctx.response.body = rtn;
          return;
        }
      } else if (vote_log["vote_times"] >= 10) {
        let rtn = {};
        rtn["success"] = false;
        rtn["data"] = {};
        rtn["vote_to"] = JSON.parse(vote_log["vote_to"]);
        rtn["data"]["msg"] = "Reach Max vote times!";
        ctx.response.body = rtn;
        return;
      } else {
        let vote_to = JSON.parse(vote_log["vote_to"]);
        for (let c of vote_to) {
          if (c == id) {
            let rtn = {};
            rtn["success"] = false;
            rtn["data"] = {};
            rtn["data"]["vote_to"] = vote_to;
            rtn["data"]["msg"] = "Can't repeat vote to one person";
            ctx.response.body = rtn;
            return;
          }
        }
        vote_to.push(id);
        rtn["data"] = {};
        rtn["data"]["vite_to"] = vote_to;
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
    let votes = candidate["vote_num"] + 1;
    try {
      await Candidate.update(
        {
          vote_num: votes,
          updated_at: Date.now()
        },
        { where: { id: id } }
      );
    } catch (err) {
      let rtn = getError(err);
      ctx.response.body = rtn;
      return;
    }
    rtn["success"] = true;
    ctx.response.body = rtn;
  }
};
