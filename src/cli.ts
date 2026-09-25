#!/usr/bin/env node

import process from 'node:process'

import { createProgram } from './command'
import { createTerminal } from './terminal'

const terminal = createTerminal()
createProgram()
  .parseAsync(process.argv)
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    terminal.error(message)
    process.exitCode = 1
  })
