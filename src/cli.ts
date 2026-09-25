#!/usr/bin/env node

import process from 'node:process'

import chalk from 'chalk'

import { createProgram } from './command'

createProgram()
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${chalk.red('Error:')} ${message}\n`)
    process.exitCode = 1
  })
