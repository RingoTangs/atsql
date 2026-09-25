# atsql

Generate a configured `dl_adb_all.sql` initialization script from the templates
in `sqls/awaiting-use`.

简体中文说明见 [README.zh-CN.md](./README.zh-CN.md)。

## Requirements

- Node.js `22.23.2`
- pnpm `10`

## Build and run

```bash
pnpm install
pnpm build
node dist/cli.mjs gen \
  --ip 47.97.106.166 \
  --zone 万里长城 \
  --channel-count 5 \
  --out ./all.sql
```

Short options are also supported:

```bash
node dist/cli.mjs gen -i 47.97.106.166 -z 万里长城 -c 5 -o ./all.sql
```

`--ip`, `--zone`, and `--out` are required. `--channel-count` defaults to `3`
and accepts values from `3` through `10`. Existing output files are rejected by
default; pass `--force` to overwrite one.

The output is GB18030 encoded. It currently contains only the processed
`dl_adb_all.sql`; the other SQL files are not merged.

> [!WARNING]
> The generated SQL retains the template's `DROP DATABASE` and `DROP TABLE`
> statements. Review it before importing it into MySQL.

## Programmatic API

```ts
import { generateSql } from 'atsql'

const sql = await generateSql({
  ip: '47.97.106.166',
  zone: '万里长城',
  channelCount: 5,
})
```

`generateSql` returns a `Buffer` containing GB18030-encoded SQL.

## Development

- `pnpm dev`: create development bundles
- `pnpm build`: create production bundles
- `pnpm test:run`: run tests once
- `pnpm check`: run lint, formatting, type checking, and tests
