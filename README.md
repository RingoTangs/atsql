# atsql

Generate a complete AskTao database initialization script from the templates in
`sqls/awaiting-use`.

简体中文说明见 [README.zh-CN.md](./README.zh-CN.md)。

## Installation

atsql requires Node.js `>=22.12.0`.

Install it globally:

```bash
npm install --global atsql
atsql gen \
  --ip 127.0.0.1 \
  --zone 万里长城 \
  --channel-count 5 \
  --out ./all.sql
```

You can also run it without a global installation:

```bash
npx atsql gen -i 127.0.0.1 -z 万里长城 -c 5 -o ./all.sql
```

Short options work with the global command too:

```bash
atsql gen -i 127.0.0.1 -z 万里长城 -c 5 -o ./all.sql
```

`--ip`, `--zone`, and `--out` are required. `--channel-count` defaults to `3`
and accepts values from `3` through `10`. Existing output files are rejected by
default; pass `--force` to overwrite one.

The output is GB18030 encoded. It contains the configured `dl_adb_all.sql`
followed by the seven schema dumps in their template order. The generated file
uses one shared mysqldump session header and footer; each database body keeps its
original MySQL-specific statements.

`--channel-count` only controls the channel configuration written to
`dl_adb_all`; database names ending in `_1` are not duplicated.

> [!WARNING]
> The generated SQL retains the template's `DROP DATABASE` and `DROP TABLE`
> statements. Review it before importing it into MySQL.

## Programmatic API

```ts
import { generateSql } from 'atsql'

const sql = await generateSql({
  ip: '127.0.0.1',
  zone: '万里长城',
  channelCount: 5,
})
```

`generateSql` returns a `Buffer` containing the complete GB18030-encoded SQL.

## Development

Development requires Node.js `22.23.2` and pnpm `10`.

- `pnpm dev`: create development bundles
- `pnpm build`: create production bundles
- `pnpm test:run`: run tests once
- `pnpm check`: run lint, formatting, type checking, and tests
