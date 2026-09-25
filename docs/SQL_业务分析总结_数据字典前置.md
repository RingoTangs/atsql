# SQL 业务分析总结

## 1. 总体结论

这批 SQL 不是一组普通业务查询，而是一套较完整的 **MMORPG 游戏后端数据库备份**。

从数据库命名、字段和业务对象来看，整体与《问道》类游戏后端架构高度一致，涉及：

- 账号与认证
- 区服与服务器配置
- 充值与计费
- 玩家角色
- 宠物与装备
- 帮派
- 跨服赛事
- 游戏行为日志
- 数据分析
- 玩家资产交易
- 安全审计与异常处理

数据快照主要集中在 **2018 年 3～4 月**。

从 dump 结构看，没有明显的：

- Stored Procedure
- Trigger
- View

因此可以判断：

> 真正复杂的业务规则主要存在于游戏服务端代码中；数据库主要负责持久化、查询镜像、日志、分析和交易记录。

---

## 2. 整体业务架构

可以将这套数据库划分为六个主要层次：

```text
                    ┌─────────────────────┐
                    │      ADB 账号中心    │
                    │ 注册/登录/充值/安全   │
                    │ 区服/服务器配置       │
                    └──────────┬──────────┘
                               │ account
                               ▼
┌─────────────────────┐   ┌──────────────────────┐
│      DDB 动态数据    │   │      MDB 游戏镜像    │
│ 世界状态/活动状态    │   │ 角色/宠物/装备/帮派  │
│ 系统Daemon数据       │   │ 排行榜/跨服/城战     │
│ 物品找回/转移        │   └──────────┬───────────┘
└──────────┬──────────┘              │
           │ gid / iid                │ gid
           └────────────┬─────────────┘
                        ▼
               ┌──────────────────┐
               │     LDB 日志库    │
               │ 登录/升级/任务    │
               │ 战斗/道具/金币    │
               │ 宠物/GM/异常日志  │
               └────────┬─────────┘
                        │ ETL/汇总
                        ▼
               ┌──────────────────┐
               │    DMDB 分析库    │
               │ 玩家画像/经济统计 │
               │ 消耗/产出/玩法统计│
               └──────────────────┘

               ┌──────────────────┐
               │      TDB 交易库   │
               │ 寄售/藏宝阁/交易  │
               │ 买卖双方/手续费   │
               └──────────────────┘
```

整体属于典型 MMORPG 后端架构：

> **账号体系 + 游戏状态 + 数据镜像 + 行为日志 + 数据分析 + 玩家交易平台**

---

## 3. 8 个 SQL 文件的业务定位

| 文件             | 业务定位                                 |
| ---------------- | ---------------------------------------- |
| `dl_adb_all.sql` | 账号、认证、充值、区服配置中心           |
| `dl_ddb_1.sql`   | 动态世界数据、活动状态、特殊资产数据     |
| `dl_dmdb_1.sql`  | 数据分析 / 数据挖掘库                    |
| `dl_ldb_1.sql`   | 某一区服的游戏行为日志库                 |
| `dl_ldb_all.sql` | 全区日志汇总结构                         |
| `dl_mdb_1.sql`   | 某一区服的角色、宠物、装备、帮派等镜像库 |
| `dl_mdb_all.sql` | 全区镜像汇总结构                         |
| `dl_tdb_1.sql`   | 交易 / 寄售 / 藏宝类平台数据库           |

从命名规律看：

- `_1`：更像单区、单分片或单实例数据库
- `_all`：更像全区、全服或汇总结构

---

## 4. ADB：账号、认证、充值与全局配置

`dl_adb_all.sql` 可以理解为整个系统的：

> **Account + Authentication + Billing + Global Configuration**

---

### 4.1 `account`

这是游戏账号主表。

常见字段包括：

| 字段                | 业务含义          |
| ------------------- | ----------------- |
| `account`           | 登录账号          |
| `password`          | 密码或密码摘要    |
| `blocked_time`      | 封禁时间          |
| `blocked_reason`    | 封禁原因          |
| `temp_blocked_time` | 临时封禁时间      |
| `gold_coin`         | 金币 / 元宝类货币 |
| `silver_coin`       | 银币类货币        |
| `trade_coin`        | 可交易货币        |
| `name`              | 实名姓名          |
| `birthday`          | 出生日期          |
| `id_num`            | 身份证号          |
| `mobile`            | 手机号            |
| `email`             | 邮箱              |
| `adult`             | 防沉迷 / 成年状态 |
| `last_login_ip`     | 最近登录 IP       |
| `reg_date`          | 注册时间          |
| `coin_password`     | 财产 / 交易密码   |

逻辑关系：

```text
account
   │
   ├── 角色 A（gid）
   ├── 角色 B（gid）
   └── 角色 C（gid）
```

其中：

- `account` 表示账号
- `gid` 表示游戏角色的全局 ID

---

### 4.2 `charge` / `charge_log`

这一组表属于充值体系。

#### `charge`

更接近当前充值状态或计费状态。

可能包含：

```text
account
dist
count
end_time
card_bonus
```

说明系统历史上可能不仅有货币充值，还存在：

- 点卡
- 月卡
- 时长卡
- 会员到期时间

#### `charge_log`

更接近充值流水。

可记录：

- 充值来源 IP
- 充值类型
- 卡号 / 订单号
- 账号
- 区服
- 金额变化
- 计费时长变化
- 充值后余额
- 到期时间

---

### 4.3 `cost_log`

这是玩家消费流水的重要表。

可见字段类似：

```text
gid
account
server
dist
cost_coin
item_price
buy_item
buy_item_amount

silver_coin_cost
silver_coin_left

gold_coin_cost
gold_coin_left
```

它可以支持以下业务分析：

- 某个玩家一天消费多少
- 消费了哪些道具
- 金币与银币分别消耗多少
- 哪个区服消费最高
- 某个商城道具贡献多少流水
- 消费后余额变化

---

### 4.4 `district` / `server`

这两个表描述游戏区服架构。

#### `district`

可理解为“大区”。

示意字段：

```text
dist
alias
service
spa
csa
party_war_server
```

#### `server`

代表实际游戏服务器节点。

常见字段：

```text
server
ip
port
max_user
dist
enable
```

关系大致为：

```text
大区 dist
   │
   ├── 游戏服务器 server 1
   ├── 游戏服务器 server 2
   └── 游戏服务器 server 3
```

---

### 4.5 ADB 中其他业务模块

从表名可以识别出以下模块：

| 表名                   | 业务含义              |
| ---------------------- | --------------------- |
| `antiaddiction`        | 防沉迷                |
| `phone_bind`           | 手机绑定              |
| `phone_auth`           | 手机验证              |
| `pwd_protect`          | 密保                  |
| `safe_ctrl`            | 账号安全控制          |
| `ecard_*`              | 充值卡                |
| `alipay_account`       | 支付宝账号 / 支付渠道 |
| `coupon_info`          | 优惠券                |
| `gift_coin_log`        | 赠送金币日志          |
| `coin_red_packets_log` | 金币红包              |
| `arena_account`        | 竞技场资格 / 账号信息 |
| `citywar_account`      | 城战资格              |
| `partywar_account`     | 帮战资格              |
| `league_account`       | 联赛资格              |
| `csw_account`          | 跨服战相关账号        |

---

## 5. DDB：动态世界状态与通用对象持久化

DDB 与传统关系型业务库不同。

它更像：

> **游戏服务器世界状态持久化库**

---

### 5.1 `data`

其结构类似：

```text
path
name
branch
content
time
checksum
```

这不是传统的“角色表 / 宠物表 / 任务表”，而是典型的：

> **Path + Name + Branch + Serialized Content**

也就是说，服务端可能将内存中的对象序列化后直接保存到 `content`。

实际对象名可以包含：

```text
challenge_match
coin_order_list
cs_shidao_info
daemons
purchase_infos
party
lottery_info
top_list
zhengdaodian
time_info_list
douchong_dahui
```

这些对象覆盖：

- 活动
- 排行
- 订单
- 帮派
- 定时器
- Daemon
- 跨服数据
- 世界状态

因此 DDB 很可能承担：

> 活动状态、定时任务状态、排行榜、世界级数据、服务器运行状态等对象的持久化。

---

### 5.2 `basic_char_info`

这是角色基本信息索引。

常见字段：

```text
gid
name
polar
gender
```

其中：

- `gid`：角色全局 ID
- `name`：角色名
- `polar`：门派 / 五行 / 职业类属性
- `gender`：性别

---

### 5.3 `gid_info`

这是全局 ID 注册或索引表。

结构类似：

```text
gid
type
name
```

可能用于统一管理：

- 角色 ID
- 对象 ID
- 宠物 ID
- 其他全局实体 ID

---

### 5.4 `item_deposit` / `pet_deposit`

这一组表很像：

> **客服 / 安全暂存系统**

可能记录：

- 原所有人
- 新所有人
- 存入操作人
- 存入原因
- 取出操作人
- 取出原因
- 物品完整数据
- 宠物完整数据

典型业务流程：

```text
玩家资产
   ↓
暂扣 / 冻结
   ↓
客服调查
   ↓
返还 / 转移
```

适用于：

- 盗号
- 申诉
- 异常交易
- 资产追回
- GM 介入

---

### 5.5 `property_recall`

该表很明显属于：

> 财产找回 / 资产恢复

常见字段：

```text
owner
iid
name
data
take
exchange
checksum
```

---

### 5.6 `transfer_data`

更接近：

> 跨区、跨模块、转服或异步资产迁移

字段类似：

```text
transfer_id
owner
class
type
iid
data
source
transfer_account
request_gid
state
```

可能服务于：

- 角色迁移
- 转服
- 物品迁移
- 活动奖励发放
- 跨系统资产传输

---

## 6. MDB：角色、宠物、装备等当前快照

MDB 是非常重要的：

> **玩家当前状态查询镜像库**

它适合客服、后台、排行榜和运营查询。

---

### 6.1 `char_info`

这是角色当前画像的核心表。

可能包含：

```text
account
gid
name
level
exp
tao
party
family
cash
balance

str
con
dex
wiz

phy_power
mag_power
speed
def
```

以及：

- 竞技场数据
- 排行榜数据
- VIP
- 成就
- 道行
- 帮贡
- 称号
- 战斗属性

它可以用于回答：

- 玩家现在多少级
- 当前道行多少
- 属于哪个帮派
- 当前货币多少
- 最后一次更新时间
- 当前基础属性

---

### 6.2 `pet_info`

宠物当前状态快照。

字段可能包括：

```text
owner
owner_name
name
iid
level
exp
martial
loyalty
longevity
str
con
dex
wiz
phy_power
mag_power
```

逻辑关系：

```text
char_info.gid
      │
      └── pet_info.owner
```

---

### 6.3 `item_info`

装备 / 物品当前状态快照。

可能包含：

```text
owner
name
iid
durability
amount
rebuild_level
color
suit_level
req_level
perfect_degree
```

因此角色资产关系可以简化为：

```text
角色 gid
 │
 ├── item_info
 ├── pet_info
 └── child_info
```

---

### 6.4 帮派系统

#### `party_basic_info`

表示帮派主数据。

可能包含：

- 帮派名称
- 创建人
- 等级
- 建设度
- 资金
- 公告
- 技能
- 活跃度
- 战绩

#### `party_members_info`

表示帮派成员明细。

可能包含：

- 成员
- 职位
- 帮贡
- 活跃度

---

### 6.5 排行榜

#### `top_char`

角色排行榜缓存。

#### `top_pet`

宠物排行榜缓存。

常见结构：

```text
top_index
rank
dist
name
val
```

这说明排行榜可能不是实时扫描角色表，而是：

> 预计算 / 缓存式排行榜

---

### 6.6 跨服竞技与联赛

可识别的相关表：

```text
csc_sign_info
csl_dist_info
csl_match_info
csl_person_info
csw_sign_info
```

可能对应：

- 报名
- 区服
- 赛季
- 轮次
- 赛程
- 比分
- 积分
- 个人贡献
- 胜负

---

## 7. LDB：玩家行为日志与审计流水

LDB 可以理解为：

> **Log Database**

它保存了大量玩家行为和系统事件。

---

### 7.1 `login_log`

记录玩家登录时的信息和状态。

常见字段可能包括：

```text
account
gid
角色名
区服
服务器
IP
等级
道行
金币
银币
帮派
创建时间
保护方式
```

可用于：

- DAU
- 登录历史
- 异常 IP
- 盗号调查
- 等级分布
- 留存分析

---

### 7.2 `level_up_log`

角色升级日志。

可以分析：

- 升级速度
- 新手流失点
- 到达某等级所需时间
- 等级成长曲线

---

### 7.3 `cost_coin_log`

游戏货币消费日志。

结构示意：

```text
cost_type
cost
account
gid
item_name
amount
```

可用于：

- 元宝消耗
- 金币消耗
- 道具消费
- 经济系统 Sink 分析

---

### 7.4 `item_transfer_log`

这是非常关键的：

> **物品流转审计链**

字段可能包含：

```text
account_from
account_to
gid_from
gid_to

ip_from
ip_to

item_iid
item_name
item_amount

transfer_type
transfer_id
```

这类表可以用于：

- 盗号追踪
- 工作室检测
- 黑产分析
- 资产流转调查
- 指定装备 IID 的完整流转链

---

### 7.5 `pet_log`

表示宠物生命周期日志。

可以记录：

- 获得
- 升级
- 操作
- 消耗
- 转移

`pet_memo` 类字段可能保存宠物属性快照。

---

### 7.6 `task_log`

任务行为日志。

结构类似：

```text
task_type
task_name
action
level
tao
```

可分析：

- 任务参与
- 任务完成
- 任务中断
- 不同等级玩家任务行为

---

### 7.7 `combat_log`

战斗日志。

字段可能包括：

```text
角色
IP
MAC
等级
道行
战斗回合
异常回合
属性
```

其中可见：

```text
abnormal_round
abnormal_degree
```

说明该日志不仅用于战斗统计，还可能用于：

> **外挂 / 异常战斗检测**

---

### 7.8 其他日志模块

| 表名                     | 业务含义   |
| ------------------------ | ---------- |
| `chat_log`               | 聊天       |
| `gm_log`                 | GM 操作    |
| `equipment_log`          | 装备操作   |
| `sale_log`               | 出售       |
| `coin_order_log`         | 游戏币订单 |
| `anti_cheater_log`       | 反作弊     |
| `antiaddiction_log`      | 防沉迷     |
| `report_log`             | 举报       |
| `safe_log`               | 安全操作   |
| `plug_log`               | 外挂相关   |
| `task_log`               | 任务       |
| `combat_log`             | 战斗       |
| `pet_level_up_log`       | 宠物升级   |
| `csl_match_log`          | 跨服赛事   |
| `client_performance_log` | 客户端性能 |
| `system_monitor_log`     | 系统监控   |

---

## 8. DMDB：分析汇总与数据挖掘

DMDB 与 LDB 有大量同名表，但又额外存在分析类表。

因此它更像：

> **Data Mining Database / Data Mart Database**

主要用于：

- 玩家画像
- 游戏经济分析
- 玩法分析
- 消耗 / 产出统计
- 运营报表

---

### 8.1 `account_basic`

账号基础画像汇总。

可能汇总：

- 货币
- 最近时间
- 当前状态
- 活跃信息

---

### 8.2 `char_basic`

角色基础画像。

用于统一汇总角色当前关键指标。

---

### 8.3 `char_incre`

角色增量统计。

可能包含：

```text
gid
exp
cash
tao
reputation
pot
total_score
party_contrib
```

含义不是“当前值”，而更像：

> 某个统计周期内的增量

适合分析：

- 经验增长
- 现金增长
- 道行增长
- 声望增长
- 潜能增长
- 帮贡增长

---

### 8.4 `char_cost`

角色货币消耗。

例如：

```text
gid
silver_coin
gold_coin
```

---

### 8.5 `coin_cost`

货币消耗明细 / 汇总。

可能包含：

```text
name
coin
coin_type
gid
account
```

可以用于：

- 元宝消费排行
- 金币消耗渠道
- 玩家 ARPU
- 经济系统 Sink 分析

---

### 8.6 `charge_item_sale`

商城商品销售分析。

结构可能类似：

```text
item
amount
coin
coin_type
account
```

业务含义：

> 商城商品销售统计

---

### 8.7 玩法分析表

例如：

```text
game_yabiao
game_wanyaoku
game_chongwutaowang
```

可对应：

- 押镖
- 万妖窟
- 宠物逃亡

类似表中常见：

```text
gid
level
polar
insider
times
```

说明它们主要用于：

- 不同等级玩家参与次数
- 不同门派参与情况
- VIP / 会员玩家参与情况
- 活动渗透率

---

## 9. TDB：寄售、交易与藏宝类平台

TDB 可以理解为：

> **玩家高价值资产交易平台数据库**

---

### 9.1 `treasure_info`

寄售商品主表。

可能包含：

- 卖家
- 卖家账号
- 卖家区服
- 买家
- 买家账号
- 买家区服
- 原价
- 当前价
- 起拍价
- 上架时间
- 出售时长
- 出售方式
- 装备快照
- 道具快照
- 宠物快照
- 角色 / 孩子快照

这意味着交易平台可能支持：

- 装备
- 宠物
- 道具
- 角色相关资产

---

### 9.2 `trading_record`

成交记录。

常见字段：

```text
seller
buyer
price
service_charge
item_order_id
```

用于回答：

- 谁卖给谁
- 成交价多少
- 手续费多少
- 哪个订单成交

---

### 9.3 `transaction_log`

交易平台调用外部系统的事务记录。

可能包含：

```text
transaction_id
module
func
para
result
http_got
repeat_times
```

这反映出交易流程中可能存在：

- HTTP / RPC 调用
- 外部模块
- 重试
- 幂等
- 事务恢复

这对高价值游戏资产交易非常重要。

---

## 10. 核心 ID 与业务键

后续写 SQL 时，必须先理解这些标识符。

| 字段          | 含义                  |
| ------------- | --------------------- |
| `account`     | 游戏登录账号          |
| `gid`         | 游戏角色全局 ID       |
| `dist`        | 游戏大区              |
| `server`      | 实际游戏服务器 / 线路 |
| `iid`         | 资产实例 ID           |
| `item_iid`    | 具体物品实例 ID       |
| `pet_iid`     | 具体宠物实例 ID       |
| `order_id`    | 订单 ID               |
| `transfer_id` | 转移事务 ID           |

核心链路：

```text
account
  ↓
gid
  ↓
角色
 ├── item_iid
 └── pet_iid
```

跨库逻辑关联主要依赖：

```text
account
gid
dist
server
iid
```

一个明显的架构特点是：

> 数据库层几乎不依赖 Foreign Key，关系由游戏服务端程序维护。

---

## 11. 典型玩家业务流程

可以将玩家生命周期抽象为：

```text
1. 注册账号
   ↓
ADB.account

2. 登录某一区服
   ↓
ADB.district / server
   ↓
LDB.login_log

3. 创建角色
   ↓
gid
   ↓
MDB.char_info

4. 获得装备
   ↓
item_iid
   ↓
MDB.item_info
   ↓
LDB.item_transfer_log / equipment_log

5. 获得宠物
   ↓
pet_iid
   ↓
MDB.pet_info
   ↓
LDB.pet_log

6. 做任务、升级、打怪
   ↓
task_log
combat_log
level_up_log

7. 花金币购买东西
   ↓
cost_coin_log
cost_log

8. 行为数据进入分析层
   ↓
DMDB
   ↓
消费分析 / 活跃分析 / 玩法分析

9. 寄售高价值资产
   ↓
TDB.treasure_info
   ↓
成交
   ↓
trading_record
```

---

## 12. 数据库设计的几个明显特征

### 12.1 时间字段大量使用字符串

很多时间可能采用：

```text
20180413160907
```

也就是：

```text
YYYYMMDDHHMMSS
```

而不是标准 `DATETIME`。

这在后续分析中需要注意：

- 排序
- 时间范围查询
- 时区
- 日期格式转换

---

### 12.2 大量通用参数字段

常见：

```text
para1
para2
para3
memo
```

这种模式意味着：

> 服务端使用“通用事件 + 参数”的日志设计

优点：

- 服务端增加新事件方便
- 表结构不需要频繁修改

缺点：

- 分析人员必须知道每种 `type/action` 对应的参数含义

---

### 12.3 大量序列化文本

常见字段：

```text
content
item_prop
pet_memo
save_to_text
snapshot
```

说明 MySQL 在部分模块中被当作：

> 对象持久化介质

而不是完全依赖规范化的关系模型。

---

### 12.4 字符编码较老

dump 中可以看到 `latin1` 声明，但业务数据中存在明显中文历史编码痕迹。

迁移或解析时建议重点检查：

- GBK
- GB18030
- latin1 错位解码
- UTF-8

不能直接假设所有中文都是 UTF-8。

---

### 12.5 很少使用数据库外键

虽然业务表之间关系非常明显，但数据库层基本没有显式 Foreign Key。

这意味着：

- 约束主要由服务端代码保证
- 跨库关联属于“逻辑关联”
- 做离线分析时要注意脏数据和孤儿记录

---

## 13. 安全与敏感数据风险

这套备份中存在较多敏感信息。

可能包括：

```text
password
org_password
id_num
mobile
email
last_login_ip
内部 IP
服务器地址
接口 URL
充值 / 交易相关配置
```

如果是真实历史生产数据，分析前建议至少做：

```text
账号        → Hash / 脱敏
手机号      → 脱敏
身份证      → 删除或脱敏
IP          → 脱敏
密码字段    → 删除
内部地址    → 删除
敏感接口配置 → 删除
```

---

## 14. 最终业务总结

如果用一句话概括这套数据库：

> 这是一个 MMORPG 游戏的完整后台数据体系：ADB 管账号与充值，DDB 保存游戏世界动态状态，MDB 保存角色/装备/宠物等当前快照，LDB 记录玩家行为，DMDB 负责数据统计分析，TDB 管理玩家资产交易。

从数据使用角度，可以进一步抽象成：

```text
账号体系
   ↓
角色体系
   ↓
资产体系
   ↓
行为日志
   ↓
数据分析
   ↓
运营 / 风控 / 客服 / 交易平台
```

后续如果继续做数据治理，最重要的工作包括：

1. 建立完整数据字典
2. 明确跨库逻辑主键
3. 梳理 account / gid / iid 关系
4. 建立核心业务关系图
5. 标注日志参数含义
6. 建立常用业务查询模板
7. 对敏感数据做脱敏与访问控制
