import process from 'node:process'
import chalk from 'chalk'

export interface WritableOutput {
  write: (message: string) => unknown
}

export interface Terminal {
  success: (message: string) => void
  warning: (message: string) => void
  error: (message: string) => void
}

interface TerminalOptions {
  stdout?: WritableOutput
  stderr?: WritableOutput
}

export const createTerminal = (options: TerminalOptions = {}): Terminal => {
  const stdout = options.stdout ?? process.stdout
  const stderr = options.stderr ?? process.stderr

  return {
    success: (message) => {
      stdout.write(`${chalk.green('Generated')} ${message}\n`)
    },
    warning: (message) => {
      stderr.write(`${chalk.yellow('Warning:')} ${message}\n`)
    },
    error: (message) => {
      stderr.write(`${chalk.red('Error:')} ${message}\n`)
    },
  }
}
