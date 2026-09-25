# atsql

根据 `sqls/awaiting-use` 中的模板生成完整的问道数据库初始化脚本。

[English](./README.md) | 简体中文

## 安装与使用

atsql 要求 Node.js `>=22.12.0`。

全局安装：

```bash
npm install --global atsql
atsql gen \
  --ip 127.0.0.1 \
  --zone 万里长城 \
  --channel-count 5 \
  --out ./all.sql
```

也可以不全局安装，直接运行：

```bash
npx atsql gen -i 127.0.0.1 -z 万里长城 -c 5 -o ./all.sql
```

全局命令也支持短参数：

```bash
atsql gen -i 127.0.0.1 -z 万里长城 -c 5 -o ./all.sql
```

`--ip`、`--zone` 和 `--out` 为必填参数。`--channel-count` 默认值为 `3`，允许范围为
`3–10`。默认拒绝覆盖已有输出文件，需要覆盖时使用 `--force`。

输出文件使用 GB18030 编码，依次包含配置完成的 `dl_adb_all.sql` 和其余 7 个建表
dump。合并结果只使用一套全局 mysqldump 会话头尾，各数据库正文中的 MySQL 专属语句
保持不变。

`--channel-count` 只控制 `dl_adb_all` 中写入的线路配置，不会复制以 `_1` 结尾的数据库。

> [!WARNING]
> 生成结果会保留模板中的 `DROP DATABASE` 和 `DROP TABLE` 语句，导入 MySQL 前请先检查。

## TypeScript API

```ts
import { generateSql } from 'atsql'

const sql = await generateSql({
  ip: '127.0.0.1',
  zone: '万里长城',
  channelCount: 5,
})
```

`generateSql` 返回包含完整 GB18030 编码 SQL 的 `Buffer`。

## 开发命令

开发环境使用 Node.js `22.23.2` 和 pnpm `10`。

- `pnpm dev`：生成开发构建
- `pnpm build`：生成生产构建
- `pnpm test:run`：运行一次测试
- `pnpm check`：运行 lint、格式检查、类型检查和测试
