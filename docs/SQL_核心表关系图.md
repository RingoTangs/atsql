# SQL 核心表关系图

> 说明：原始 DDL 未定义 FOREIGN KEY。以下均为根据主键、字段名及业务语义还原的**逻辑关联**，不是数据库层强制约束。

## 1. 主业务链：账号 → 角色 → 资产 → 日志 → 分析

```mermaid
flowchart LR
  A[ADB.account\n账号主数据] -->|account| C[MDB.char_info\n角色快照]
  D[ADB.district\n大区] -->|dist| C
  S[ADB.server\n服务器] -->|server/dist| L[LDB.*_log\n行为日志]
  C -->|gid/owner| I[MDB.item_info\n物品装备]
  C -->|gid/owner| P[MDB.pet_info\n宠物]
  C -->|gid| CH[MDB.child_info\n子女]
  C -->|gid/account| L
  I -->|item_iid/iid| L
  P -->|pet_iid/iid| L
  L -. ETL/汇总 .-> M[DMDB.*\n分析与汇总]
```

## 2. 帮派、城战与跨服赛事

```mermaid
flowchart LR
  C[MDB.char_info] -->|member_gid| PM[MDB.party_members_info]
  PB[MDB.party_basic_info] -->|dist,gid| PM
  PB -->|dist,gid| PS[MDB.party_skills_info]
  PB -->|party_gid/name| CI[MDB.city_info]
  D[ADB.district] -->|attack_dist / defense_dist| CW[MDB.citywar_info]
  D -->|dist| CD[MDB.csl_dist_info]
  CD --> CM[MDB.csl_match_info]
  CM -->|season+league+round+match| CP[MDB.csl_person_info]
  C -->|gid| CP
  CM --> CL[LDB/DMDB csl_*_log]
```

## 3. 交易/寄售平台

```mermaid
flowchart LR
  C[MDB.char_info] -->|gid/account| TP[TDB.trading_platform_log]
  C -->|seller/buyer上下文| T[TDB.treasure_info\n寄售商品]
  I[MDB.item_info / pet_info] -. snapshot .-> T
  T -->|item_order_id / goods_id| R[TDB.trading_record\n成交记录]
  T -->|goods_id| X[TDB.transaction_log\n接口事务/重试]
```

## 4. 客服资产追踪链

```mermaid
flowchart LR
  C[MDB.char_info] -->|owner/gid| I[MDB.item_info / pet_info]
  I -->|iid| T[DDB.item_deposit / pet_deposit\n暂存/扣押]
  I -->|iid/owner| R[DDB.property_recall\n资产找回]
  I -->|iid/owner| X[DDB.transfer_data\n跨系统转移]
  I -->|item_iid / pet_iid| L[LDB.item_transfer_log / important_pet_log]
```

完整的逐表关系请看 Excel 中的「逻辑关系」工作表。
