# VotingBackEnd
## Version
> v1

## URL
> unknown

## BASE
```
// 成功
{
    "success": true,
    "data": {

    }
}

// 失败
{
    "success": false,
    "data": {
        "msg": "xxxx"
    }
}
```

## 前端接口
### 初始化投票首页
```
[GET] api/votes 
```
#### 返回数据
```
{
  "success": true,
  "data": {
    "banner": "/assets/ic_banner.jpg",
    "title": "十大杰出青年评选投票",
    "beginTime": "2018-03-05 12:00",
    "endTime": "2018-03-05 12:00",
    "summary": "如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦",
    "candidates": [{
        "id": 1,
        "name": "",
        "avatar": "/assets/1.jpg",
        "info": "<span>如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦</span>如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦如果你无法简洁的表达你的想法，那只能说明你还不够了解它。--阿尔伯特·爱英斯坦",
        "votes": 100,
      },
      {
        "id": 2,
        "name": "",
        "avatar": "/assets/2.jpg",
        "info": "",
        "votes": 100,
      },
      {
        "id": 3,
        "name": "",
        "avatar": "/assets/3.jpg",
        "info": "",
        "votes": 100,
      },
      ...
    ]
  }
}
```

### 获取投票排行
```
[GET] /api/rank
```
#### 返回数据
```
{
  "success": true,
  "data": [{
      "name": "xxx",
      "votes": 100,
    },
    {
      "name": "aaa",
      "votes": 100,
    },
    {
      "name": "vvv",
      "votes": 100,
    },
    {
      "name": "bbb",
      "votes": 100,
    },
    {
      "name": "ddd",
      "votes": 100,
    },
    {
      "name": "eee",
      "votes": 100,
    }
  ]
}
```

### 投票操作
```
[POST] /api/vote
```
#### 提交数据
```
body:
{
    "id": 1  //候选人id
}
```
#### 返回数据
```
{
  "success": true,
  "data": {}
}
```

## 后台接口
### 登录操作
```
[POST] /admin/login
```
#### 提交数据
```
body:
{
  "username": "admin",
  "password": "admin"
}
```
#### 返回数据
```
{
  "success": true,
  "data": {
    "token": "xxx-xxx-xxx"
  }
}
```

### 注销操作
```
[POST] /admin/logout
```
#### 提交数据
```
body:
{
  "username": "xxxx",
  "token": "xxx-xxx-xxx" // token 随机生成
}
```
#### 返回数据
```
{
  "success": true,
  "data": {
  }
}
```

### 获取设置信息接口
```
[GET] /admin/setting
```
#### 返回数据
```
{
  "success": true,
  "data": {
    "title": "abc",    // 标题
    "summary": "abc",  // 简介内容
    "starttime": "",   // 开始时间
    "endtime": ""      // 截止时间
  }
}
```

### 保存设置信息接口
```
[POST] /admin/setting
```
#### 提交数据
```
body:
{
  "title": "abc",    // 标题
  "summary": "abc",  // 简介内容
  "starttime": "",   // 开始时间
  "endtime": ""      // 截止时间
}
```
#### 返回数据
```
{
  "success": true,
  "data": {
  }
}
```

### 获取排行结果接口
```
[GET] /admin/result
```
#### 返回数据
```
{
  "success": true,
  "data": [
    {
      "name": "acc",
      "votes": 100
    },
    {
      "name": "bcc",
      "votes": 50
    }
  ]
}
```

### 修改排行结果接口
```
[POST] /admin/result
```
#### 提交数据
```
body:
{
  "name": "",   // 获选人名字
  "votes": 100, // 新的票数
}
```
#### 返回数据
```
{
  "success": true,
  "data": {
  }
}
```

### 获取IP列表
```
[GET] /admin/ip
```
#### 返回数据
```
{
  "success": true,
  "data": [
    {
      "ip": "",   // ipv4
      "user": "", // 候选人姓名
      "time": "", // 时间
    }
  ]
}
```
