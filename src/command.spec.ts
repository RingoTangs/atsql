import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import iconv from 'iconv-lite'
import { afterEach, describe, expect, it } from 'vitest'

import { createProgram } from './command'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

const createTemporaryDirectory = async (): Promise<string> => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'atsql-'))
  temporaryDirectories.push(directory)
  return directory
}

const silentOutput = { write: (): boolean => true }

describe('gen command', () => {
  it('supports short options and creates parent directories', async () => {
    const cwd = await createTemporaryDirectory()
    const program = createProgram({
      cwd,
      stdout: silentOutput,
      stderr: silentOutput,
    })

    await program.parseAsync([
      'node',
      'atsql',
      'gen',
      '-i',
      '47.97.106.166',
      '-z',
      '万里长城',
      '-c',
      '5',
      '-o',
      'generated/all.sql',
    ])

    const output = iconv.decode(
      await readFile(path.join(cwd, 'generated/all.sql')),
      'gb18030',
    )
    expect(output.match(/^INSERT INTO `server`/gm)).toHaveLength(5)
  })

  it('refuses an existing file unless --force is provided', async () => {
    const cwd = await createTemporaryDirectory()
    const outputPath = path.join(cwd, 'all.sql')
    await writeFile(outputPath, 'existing')

    const args = [
      'node',
      'atsql',
      'gen',
      '--ip',
      '47.97.106.166',
      '--zone',
      '万里长城',
      '--out',
      'all.sql',
    ]

    await expect(
      createProgram({
        cwd,
        stdout: silentOutput,
        stderr: silentOutput,
      }).parseAsync(args),
    ).rejects.toThrow('Output file already exists')

    await createProgram({
      cwd,
      stdout: silentOutput,
      stderr: silentOutput,
    }).parseAsync([...args, '--force'])

    expect(await readFile(outputPath, 'utf8')).not.toBe('existing')
  })

  it('rejects a non-integer channel count', async () => {
    const cwd = await createTemporaryDirectory()
    let errors = ''
    const program = createProgram({
      cwd,
      stdout: silentOutput,
      stderr: {
        write: (message): boolean => {
          errors += message
          return true
        },
      },
    }).exitOverride()

    await expect(
      program.parseAsync([
        'node',
        'atsql',
        'gen',
        '--ip',
        '47.97.106.166',
        '--zone',
        '万里长城',
        '--channel-count',
        '3.5',
        '--out',
        'all.sql',
      ]),
    ).rejects.toThrow('process.exit unexpectedly called')
    expect(errors).toContain('must be an integer between 3 and 10')
  })
})
