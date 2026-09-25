#!/usr/bin/env node

import process from 'node:process'
import { createProgram } from './command'
import { failure } from './output'

createProgram()
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    console.log(`${failure('Error:')} ${message}`)
    process.exitCode = 1
  })
