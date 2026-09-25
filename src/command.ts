import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import chalk from 'chalk'
import { Command, InvalidArgumentError } from 'commander'

import pkg from '../package.json' with { type: 'json' }
import {
  channelConfig,
  channelCountErrorMessage,
  channelCountRange,
  isValidChannelCount,
} from './config'
import { generateSql } from './generator'

interface WritableOutput {
  write: (message: string) => unknown
}

interface CommandDependencies {
  cwd?: string
  stdout?: WritableOutput
  stderr?: WritableOutput
}

const parseChannelCount = (value: string): number => {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError(channelCountErrorMessage)
  }

  const count = Number(value)
  if (!isValidChannelCount(count)) {
    throw new InvalidArgumentError(channelCountErrorMessage)
  }

  return count
}

export const createProgram = (
  dependencies: CommandDependencies = {},
): Command => {
  const cwd = dependencies.cwd ?? process.cwd()
  const stdout = dependencies.stdout ?? process.stdout
  const stderr = dependencies.stderr ?? process.stderr
  const program = new Command()

  program
    .name('atsql')
    .description('Generate a configured ADB initialization SQL file')
    .version(pkg.version)
    .configureOutput({
      writeOut: (message) => stdout.write(message),
      writeErr: (message) => stderr.write(message),
    })

  program
    .command('gen')
    .description('Generate sqls/awaiting-use/dl_adb_all.sql')
    .requiredOption('-i, --ip <ipv4>', 'server IPv4 address')
    .requiredOption('-z, --zone <name>', 'zone name')
    .option(
      '-c, --channel-count <count>',
      `number of channels (${channelCountRange})`,
      parseChannelCount,
      channelConfig.defaultCount,
    )
    .requiredOption('-o, --out <path>', 'output SQL file')
    .option('--force', 'overwrite an existing output file', false)
    .action(
      async (options: {
        ip: string
        zone: string
        channelCount: number
        out: string
        force: boolean
      }) => {
        const outputPath = path.resolve(cwd, options.out)
        const sql = await generateSql(options)

        await mkdir(path.dirname(outputPath), { recursive: true })

        try {
          await writeFile(outputPath, sql, {
            flag: options.force ? 'w' : 'wx',
          })
        } catch (error) {
          if (
            !options.force &&
            error instanceof Error &&
            'code' in error &&
            error.code === 'EEXIST'
          ) {
            throw new Error(
              `Output file already exists: ${outputPath}. Use --force to overwrite it.`,
            )
          }
          throw error
        }

        stdout.write(
          `${chalk.green('Generated')} ${outputPath} (${options.channelCount} channels, GB18030)\n`,
        )
        stdout.write(
          `${chalk.yellow('Warning:')} the generated SQL contains DROP DATABASE and DROP TABLE statements.\n`,
        )
      },
    )

  return program
}
