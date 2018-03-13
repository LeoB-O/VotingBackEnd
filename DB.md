### DB_NAME: vote

#### 候选人表：candidate

|字段名|数据类型|说明|
|--|--|--|
|id|INT|候选人编号|
|name|VARCHAR(10)|候选人姓名|
|info|TEXT|候选人介绍|
|vote_num|INT|获得票数|
|created_at|BIGINT|创建时间|
|updated_at|BIGINT|更新时间|

#### 用户表：user
|字段名|数据类型|说明|
|--|--|--|
|id|INTEGER||
|user_name|VARCHAR(20)|用户名|
|password|VARCHAR(32)|密码|
|permission|TINYINT(4)|权限类型|
|created_at|BIGINT|创建时间|
|updated_at|BIGINT|更新时间|

#### 投票纪录表：vote_log
|字段名|数据类型|说明|
|--|--|--|
|id|int||
|ip|VARCHAR(15)|IP地址|
|vote_times|INT|投票次数|
|vote_to|VARCHAR(100)|是一个"[ ]"格式的文字，类似数组，保存id|
|created_at|BIGINT|创建时间|
|updated_at|BIGINT|更新时间|

#### 设置表：setting
|字段名|数据类型|说明|
|--|--|--|
|id|INT|编号|
|key|TEXT|键|
|value|TEXT|值|
|activated|tinyint|是否被启用（程序里没用）|
|created_at|BIGINT|创建时间|
|updated_at|BIGINT|更新时间|