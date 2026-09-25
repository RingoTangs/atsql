import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import pkg from '../package.json' with { type: 'json' }

const requiredFiles = [
  'dist/cli.d.mts',
  'dist/cli.mjs',
  'dist/index.d.mts',
  'dist/index.mjs',
  'sqls/awaiting-use/dl_adb_all.sql',
  'sqls/awaiting-use/segment_config.sql',
  'sqls/awaiting-use/segment_server.sql',
]

const allowedSqlFiles = new Set(
  requiredFiles.filter((file) => file.endsWith('.sql')),
)
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const npmCache = mkdtempSync(path.join(tmpdir(), 'atsql-npm-cache-'))
let output

try {
  output = execFileSync(
    npmCommand,
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    {
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: npmCache },
    },
  )
} finally {
  rmSync(npmCache, { recursive: true, force: true })
}

const [pack] = JSON.parse(output)

if (!pack || pack.name !== pkg.name || pack.version !== pkg.version) {
  throw new Error('npm pack returned unexpected package metadata')
}

if (pkg.bin?.atsql !== './dist/cli.mjs') {
  throw new Error(
    'package.json must expose ./dist/cli.mjs as the atsql command',
  )
}

const packedFiles = new Map(pack.files.map((file) => [file.path, file]))

for (const file of requiredFiles) {
  if (!packedFiles.has(file)) {
    throw new Error(`Missing required package file: ${file}`)
  }
}

const cli = packedFiles.get('dist/cli.mjs')
if ((cli.mode & 0o111) === 0) {
  throw new Error('dist/cli.mjs must be executable')
}

const unexpectedSqlFiles = [...packedFiles.keys()].filter(
  (file) =>
    file.startsWith('sqls/awaiting-use/') &&
    file.endsWith('.sql') &&
    !allowedSqlFiles.has(file),
)

if (unexpectedSqlFiles.length > 0) {
  throw new Error(
    `Unexpected SQL files in package: ${unexpectedSqlFiles.join(', ')}`,
  )
}

console.log(
  `Package contents verified: ${pack.name}@${pack.version} (${pack.entryCount} files)`,
)
