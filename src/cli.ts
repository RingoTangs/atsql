#!/usr/bin/env node

import process from 'node:process'
import { createProgram } from './command'
import { failure } from './output'

createProgram()
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${failure('Error:')} ${message}\n`)
    process.exitCode = 1
  })
