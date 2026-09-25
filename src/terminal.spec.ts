import { Chalk } from 'chalk'
import { describe, expect, it } from 'vitest'
import { createTerminal } from './terminal'

interface CapturedOutput {
  output: string
  write: (message: string) => boolean
}

const captureOutput = (): CapturedOutput => {
  const captured: CapturedOutput = {
    output: '',
    write: (message) => {
      captured.output += message
      return true
    },
  }
  return captured
}

describe('createTerminal', () => {
  it('writes success messages to stdout', () => {
    const stdout = captureOutput()
    const stderr = captureOutput()
    const terminal = createTerminal({ stdout, stderr })

    terminal.success('output.sql')

    expect(stdout.output).toContain('Generated')
    expect(stdout.output).toContain('output.sql')
    expect(stdout.output.endsWith('\n')).toBe(true)
    expect(stderr.output).toBe('')
  })

  it('formats interactive output with semantic colors', () => {
    const stdout = captureOutput()
    const stderr = captureOutput()
    const stdoutColor = new Chalk({ level: 1 })
    const stderrColor = new Chalk({ level: 1 })
    const terminal = createTerminal({
      stdout,
      stderr,
      colors: { stdout: stdoutColor, stderr: stderrColor },
    })

    terminal.success('output.sql')
    terminal.warning('review the SQL')
    terminal.error('generation failed')

    expect(stdout.output).toContain(stdoutColor.green('Generated'))
    expect(stderr.output).toContain(stderrColor.yellow('Warning:'))
    expect(stderr.output).toContain(stderrColor.red('Error:'))
    expect(terminal.format.title('Options:')).toBe(stdoutColor.bold('Options:'))
    expect(terminal.format.command('gen')).toBe(stdoutColor.cyan('gen'))
    expect(terminal.format.option('--force')).toBe(stdoutColor.cyan('--force'))
    expect(terminal.format.optionTerm('--ip <ipv4>')).toContain(
      stdoutColor.yellow('<ipv4>'),
    )
    expect(terminal.format.argument('<path>')).toBe(
      stdoutColor.yellow('<path>'),
    )
    expect(terminal.format.error('error: invalid option')).toBe(
      stderrColor.red('error: invalid option'),
    )
    expect(terminal.hasColors).toEqual({ stdout: true, stderr: true })
  })

  it('keeps redirected output free of ANSI control codes', () => {
    const stdout = captureOutput()
    const stderr = captureOutput()
    const noColor = new Chalk({ level: 0 })
    const terminal = createTerminal({
      stdout,
      stderr,
      colors: { stdout: noColor, stderr: noColor },
    })

    terminal.success('output.sql')
    terminal.error('generation failed')

    expect(stdout.output).toBe('Generated output.sql\n')
    expect(stderr.output).toBe('Error: generation failed\n')
    expect(terminal.format.title('Options:')).toBe('Options:')
    expect(terminal.hasColors).toEqual({ stdout: false, stderr: false })
  })

  it('writes warning and error messages to stderr', () => {
    const stdout = captureOutput()
    const stderr = captureOutput()
    const terminal = createTerminal({ stdout, stderr })

    terminal.warning('review the SQL')
    terminal.error('generation failed')

    expect(stdout.output).toBe('')
    expect(stderr.output).toContain('Warning:')
    expect(stderr.output).toContain('review the SQL')
    expect(stderr.output).toContain('Error:')
    expect(stderr.output).toContain('generation failed')
    expect(stderr.output.match(/\n/g)).toHaveLength(2)
  })
})
