import chalk from 'chalk'

export function success(value: string): string {
  return chalk.green(value)
}

export function failure(value: string): string {
  return chalk.red(value)
}
