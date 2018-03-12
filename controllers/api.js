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

module.exports = {
  "GET /api/votes": async (ctx, next) => {
    let rtn = {};
    let data = {};
    let temp_array = [];
    try {
      let candidate = await Candidate.findAll({
        attributes: ["id", "name", "info", "vote_num", "avater"]
      });
      let setting = await Setting.findAll({ attributes: ["key", "value"] });
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
      let candidate = await Candidate.findAll({
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
      let rtn = {};
      rtn["success"] = false;
      rtn["data"] = {};
      rtn["data"]["msg"] = "Params Error! Expect id!";
      ctx.response.body = rtn;
      return;
    }
    try {
      let candidate = await Candidate.find({ where: { id: id } });
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
      let vote_log = await Vote_log.find({
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
      if (60 * 60 * 24 < interval) {
        let vote_to = [id];
        try {
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
    let rtn = {};
    rtn["success"] = true;
    rtn["data"] = {};
    ctx.response.body = rtn;
  }
};
