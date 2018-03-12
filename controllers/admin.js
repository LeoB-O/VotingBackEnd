const model = require("../model");

let Candidate = model.Candidate;
let Setting = model.Setting;
let User = model.User;
let Vote_log = model.Vote_log;
let Token = model.Token;

function valid_token(valid_username, token, username, find_token) {
  let rtn = {};
  let data = {};
  if (!find_token) {
    rtn["success"] = false;
    data["errorcode"] = 400;
    data["msg"] = "User does not exist or has logged out!";
    rtn["data"] = data;
    return rtn;
  }
  if (valid_username && find_token["user_name"] != username) {
    rtn["success"] = false;
    data["errorcode"] = 400;
    data["msg"] = "Token does not match with username!";
    rtn["data"] = data;
    return rtn;
  }
  rtn["success"] = true;
  rtn["data"] = data;
  return rtn;
}

function randomWord(randomFlag, min, max) {
  var str = "",
    range = min,
    arr = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
    ];
  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

module.exports = {
  "POST /admin/login": async (ctx, next) => {
    let username = ctx.request.body["username"];
    let password = ctx.request.body["password"];
    let rtn = {};
    let data = {};
    let user = await User.find({ where: { user_name: username } });
    let find_token = await Token.find({ where: { user_name: username } });
    if (!username || !password) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect username password!";
      rtn["data"] = data;
    }
    if (find_token) {
      let interval = Date.now() - find_token["updated_at"];
      if (interval < 60 * 30 * 1000) {
        rtn["success"] = false;
        data["errorcode"] = 400;
        data["msg"] = "Have logged in!";
        rtn["data"] = data;
        ctx.response.body = rtn;
        return;
      } else {
        await Token.destroy({ where: { id: find_token["id"] } });
      }
    }
    if (user["password"] != password) {
      data["errorcode"] = 400;
      data["msg"] = "Wrong password!";
      rtn["success"] = false;
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    } else {
      data["token"] = randomWord(false, 32);
      await Token.create({ token: data["token"], user_name: username });
      rtn["success"] = true;
      rtn["data"] = data;
      ctx.response.body = rtn;
    }
  },
  "POST /admin/logout": async (ctx, next) => {
    let token = ctx.request.query["token"];
    let username = ctx.request.body["username"];
    let rtn = {};
    let data = {};
    if (!token || !username) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect token and username";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    let find_token = await Token.find({ where: { token: token } });
    if (find_token && Date.now() - find_token["updated_at"] > 60 * 30 * 1000) {
      await Token.destroy({ where: { id: find_token["id"] } });
      find_token = null;
    }
    rtn = valid_token(true, token, username, find_token);
    if (!rtn["success"]) {
      ctx.response.body = rtn;
      return;
    }
    await Token.destroy({ where: { token: token } });
    rtn["success"] = true;
    rtn["data"] = data;
    ctx.response.body = rtn;
  },
  "GET /admin/setting": async (ctx, next) => {
    let token = ctx.request.query["token"];
    let rtn = {};
    let data = {};
    if (!token) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect token";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    let find_token = await Token.find({ where: { token: token } });
    if (find_token && Date.now() - find_token["updated_at"] > 60 * 30 * 1000) {
      await Token.destroy({ where: { id: find_token["id"] } });
      find_token = null;
    }
    rtn = valid_token(false, token, '', find_token);
    if (!rtn["success"]) {
      ctx.response.body = rtn;
      return;
    }
    rtn["success"] = true;    
    let setting = await Setting.findAll({ attributes: ["key", "value"] });
    if (!setting) {
      rtn["success"] = false;
      data["msg"] = "empty or db error";
    }
    for (let s of setting) {
      s = s.get({ plain: true });
      data[s["key"]] = s["value"];
    }
    rtn["data"] = data;
    ctx.response.body = rtn;
  },
  "POST /admin/setting": async (ctx, next) => {
    let token = ctx.request.query["token"];
    let rtn = {};
    let data = {};
    let title = ctx.request.body["title"];
    let summary = ctx.request.body["summary"];
    let starttime = ctx.request.body["starttime"];
    let endtime = ctx.request.body["endtime"];
    if (!token && !title && !summary && !starttime && !endtime) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect token title summary starttime endtime";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    let find_token = await Token.find({ where: { token: token } });
    if (find_token && Date.now() - find_token["updated_at"] > 60 * 30 * 1000) {
      await Token.destroy({ where: { id: find_token["id"] } });
      find_token = null;
    }
    rtn = valid_token(false, token, '', find_token);
    if (!rtn["success"]) {
      ctx.response.body = rtn;
      return;
    }
    find_title = await Setting.find({ where: { key: "title" } });
    find_title = find_title['value'];
    find_summary = await Setting.find({ where: { key: "summary" } });
    find_summary = find_summary['value'];
    find_starttime = await Setting.find({ where: { key: "beginTime" } });
    find_starttime = find_starttime['value'];
    find_endtime = await Setting.find({ where: { key: "endTime" } });
    find_endtime = find_endtime['value'];
    await Setting.update(
      { value: title || find_title },
      { where: { key: "title" } }
    );
    await Setting.update(
      { value: summary || find_summary },
      { where: { key: "summary" } }
    );
    await Setting.update(
      { value: starttime || find_starttime },
      { where: { key: "beginTime" } }
    );
    await Setting.update(
      { value: endtime || find_endtime },
      { where: { key: "endTime" } }
    );
    rtn["success"] = true;
    rtn["data"] = data;
    ctx.response.body = rtn;
  },
  "GET /admin/ip": async (ctx, next) => {
    let token = ctx.request.query["token"];
    let rtn = {};
    let data = [];
    if (!token) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect token";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    let find_token = await Token.find({ where: { token: token } });
    if (find_token && Date.now() - find_token["updated_at"] > 60 * 30 * 1000) {
      await Token.destroy({ where: { id: find_token["id"] } });
      find_token = null;
    }
    rtn = valid_token(false, token, '', find_token);
    if (!rtn["success"]) {
      ctx.response.body = rtn;
      return;
    }
    let vote_log = await Vote_log.findAll();
    let candidate = await Candidate.findAll({ attributes: ["id", "name"] });
    rtn["success"] = true;
    // TODO
    for (let v of vote_log) {
      for (let c of JSON.parse(v["vote_to"])) {
        let temp_map = {};
        let date = new Date(v["updated_at"]);
        temp_map["ip"] = v["ip"];
        temp_map["user"] = candidate[c]["name"];
        temp_map["time"] = date.toLocaleString();
        data.push(temp_map);
      }
    }
    rtn["data"] = data;
    ctx.response.body = rtn;
  },
  "GET /admin/result": async (ctx, next) => {
    let token = ctx.request.query["token"];
    let rtn = {};
    let data = {};
    if (!token) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect token";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    let find_token = await Token.find({ where: { token: token } });
    if (find_token && Date.now() - find_token["updated_at"] > 60 * 30 * 1000) {
      await Token.destroy({ where: { id: find_token["id"] } });
      find_token = null;
    }
    rtn = valid_token(false, token, '', find_token);
    if (!rtn["success"]) {
      ctx.response.body = rtn;
      return;
    }
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
  "POST /admin/result": async (ctx, next) => {
    let token = ctx.request.query["token"];
    let name = ctx.request.body["name"];
    let votes = ctx.request.body["votes"];
    let rtn = {};
    let data = {};
    if (!token || !name || !votes) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Expect token name votes";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    let find_token = await Token.find({ where: { token: token } });
    if (find_token && Date.now() - find_token["updated_at"] > 60 * 30 * 1000) {
      await Token.destroy({ where: { id: find_token["id"] } });
      find_token = null;
    }
    rtn = valid_token(false, token, '', find_token);
    if (!rtn["success"]) {
      ctx.response.body = rtn;
      return;
    }
    candidate = await Candidate.find({ name: name });
    if (!candidate) {
      rtn["success"] = false;
      data["errorcode"] = 400;
      data["msg"] = "Can not find candidate!";
      rtn["data"] = data;
      ctx.response.body = rtn;
      return;
    }
    await Candidate.update({ vote_num: votes }, { where: { name: name } });
    rtn["success"] = true;
    rtn["data"] = data;
    ctx.response.body = rtn;
    return;
  }
};