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
