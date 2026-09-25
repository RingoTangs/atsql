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
  format: {
    title: (message: string) => string
    command: (message: string) => string
    option: (message: string) => string
    optionTerm: (message: string) => string
    argument: (message: string) => string
    error: (message: string) => string
  }
  hasColors: {
    stdout: boolean
    stderr: boolean
  }
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
  const argumentPattern = /(<[^>]+>|\[[^\]]+\])/g

  return {
    success: (message) => {
      stdout.write(`${stdoutColor.green('Generated')} ${message}\n`)
    },
    warning: (message) => {
      stderr.write(`${stderrColor.yellow('Warning:')} ${message}\n`)
    },
    error: (message) => {
      stderr.write(`${stderrColor.red('Error:')} ${message}\n`)
    },
    format: {
      title: (message) => stdoutColor.bold(message),
      command: (message) => stdoutColor.cyan(message),
      option: (message) => stdoutColor.cyan(message),
      optionTerm: (message) =>
        stdoutColor.cyan(
          message.replace(argumentPattern, (argument) =>
            stdoutColor.yellow(argument),
          ),
        ),
      argument: (message) => stdoutColor.yellow(message),
      error: (message) => stderrColor.red(message),
    },
    hasColors: {
      stdout: stdoutColor.level > 0,
      stderr: stderrColor.level > 0,
    },
  }
}
