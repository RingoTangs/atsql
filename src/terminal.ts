import type { ChalkInstance } from 'chalk'
import process from 'node:process'
import chalk, { chalkStderr } from 'chalk'

export interface WritableOutput {
  write: (message: string) => unknown
}

export interface Terminal {
  success: (message: string) => void
  warning: (message: string) => void
  error: (message: string) => void
}

export interface TerminalColors {
  stdout?: ChalkInstance
  stderr?: ChalkInstance
}

interface TerminalOptions {
  stdout?: WritableOutput
  stderr?: WritableOutput
  colors?: TerminalColors
}

export const createTerminal = (options: TerminalOptions = {}): Terminal => {
  const stdout = options.stdout ?? process.stdout
  const stderr = options.stderr ?? process.stderr
  const stdoutColor = options.colors?.stdout ?? chalk
  const stderrColor = options.colors?.stderr ?? chalkStderr

  return {
    success: (message) => {
      stdout.write(`${stdoutColor.green('Generated')} ${message}`)
    },
    warning: (message) => {
      stderr.write(`${stderrColor.yellow('Warning:')} ${message}`)
    },
    error: (message) => {
      stderr.write(`${stderrColor.red('Error:')} ${message}`)
    },
  }
}
