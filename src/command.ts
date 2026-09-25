import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Command, InvalidArgumentError } from 'commander'
import pkg from '../package.json' with { type: 'json' }
import {
  channelConfig,
  channelCountErrorMessage,
  channelCountRange,
  databaseTemplateNames,
  isValidChannelCount,
} from './config'
import { generateSql } from './generator'
import { failure, success } from './output'

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

export const createProgram = (): Command => {
  const cwd = process.cwd()
  const stdout = process.stdout
  const stderr = process.stderr

  const program = new Command()

  program
    .name('atsql')
    .description('Generate a complete AskTao database initialization SQL file')
    .version(pkg.version)
    .configureOutput({
      writeOut: (message) => stdout.write(message),
      writeErr: (message) => stderr.write(message),
      outputError: (message, write) => {
        const formatted = message.replace(/^error:/, failure('Error:'))
        write(formatted)
      },
    })

  program
    .command('gen')
    .description('Generate the configured SQL database set')
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
          `${success('Generated:')} ${outputPath} (${options.channelCount} channels, ${databaseTemplateNames.length} databases, GB18030)`,
        )
      },
    )

  return program
}
