import type { Buffer } from 'node:buffer'

import { readFile } from 'node:fs/promises'
import { isIPv4 } from 'node:net'

import iconv from 'iconv-lite'

import {
  channelConfig,
  channelCountErrorMessage,
  isValidChannelCount,
} from './config'

export interface GenerateSqlOptions {
  ip: string
  zone: string
  channelCount?: number
}

const TEMPLATE_ENCODING = 'gb18030'
const templateDirectory = new URL('../sqls/awaiting-use/', import.meta.url)

const ipPlaceholders = [
  'AAA_DAILI_IP',
  'CCS_DAILI_IP',
  'CSA_DAILI_IP',
  'DBA_DAILI_IP',
  'FALLBACK_IP',
  'CHANNEL_IP',
] as const

const readTemplate = async (name: string): Promise<string> => {
  const content = await readFile(new URL(name, templateDirectory))
  return iconv.decode(content, TEMPLATE_ENCODING)
}

const countOccurrences = (content: string, value: string): number =>
  content.split(value).length - 1

const replaceAll = (
  content: string,
  replacements: Readonly<Record<string, string>>,
): string => {
  let result = content

  for (const [name, value] of Object.entries(replacements)) {
    result = result.split(`{{${name}}}`).join(value)
  }

  return result
}

const escapeSqlString = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/'/g, "''")

const validateOptions = (
  options: GenerateSqlOptions,
): Required<GenerateSqlOptions> => {
  const zone = options.zone.trim()
  const channelCount = options.channelCount ?? channelConfig.defaultCount

  if (!isIPv4(options.ip)) {
    throw new TypeError(`Invalid IPv4 address: ${options.ip}`)
  }

  if (zone.length === 0) {
    throw new TypeError('Zone must not be empty')
  }

  if (!isValidChannelCount(channelCount)) {
    throw new TypeError(`Channel count ${channelCountErrorMessage}`)
  }

  return { ip: options.ip, zone, channelCount }
}

export const replaceSegment = (
  content: string,
  segmentName: 'segment_config' | 'segment_server',
  renderedSegment: string,
): string => {
  const marker = `-- atsql:use:${segmentName}`

  if (countOccurrences(content, marker) !== 1) {
    throw new Error(`Expected exactly one ${marker} marker`)
  }

  return content.replace(marker, renderedSegment.trimEnd())
}

const renderServerSegment = async (channelCount: number): Promise<string> => {
  const segment = await readTemplate('segment_server.sql')
  const rows = segment.split(/\r?\n/).filter(Boolean)
  const templates = new Map<number, string>()

  for (const row of rows) {
    if (row.includes('{{CHANNEL_ONE_NAME}}')) templates.set(1, row)
    if (row.includes('{{CHANNEL_TWO_NAME}}')) templates.set(2, row)
    if (row.includes('{{CHANNEL_THREE_NAME}}')) templates.set(3, row)
  }

  if (templates.size !== 3) {
    throw new Error('segment_server.sql must define the first three channels')
  }

  const regularTemplate = templates
    .get(2)!
    .replace('{{CHANNEL_TWO_NAME}}', '{{CHANNEL_NAME}}')
    .replace(
      "'{{CHANNEL_IP}}',8161,1200",
      "'{{CHANNEL_IP}}',{{CHANNEL_PORT}},1200",
    )
    .replace(
      ",0,0,0,0,2,'','','',0,NULL);",
      ",0,0,0,0,{{CHANNEL_ID}},'','','',0,NULL);",
    )

  if (
    !regularTemplate.includes('{{CHANNEL_NAME}}') ||
    !regularTemplate.includes('{{CHANNEL_PORT}}') ||
    !regularTemplate.includes('{{CHANNEL_ID}}')
  ) {
    throw new Error('Could not derive a reusable channel server template')
  }

  return Array.from({ length: channelCount }, (_, index) => {
    const channelId = index + 1
    const row = templates.get(channelId) ?? regularTemplate

    return replaceAll(row, {
      CHANNEL_NAME: `{{CHANNEL_${channelId}_NAME}}`,
      CHANNEL_PORT: String(channelConfig.basePort + index),
      CHANNEL_ID: String(channelId),
    })
  }).join('\n')
}

export const generateSql = async (
  rawOptions: GenerateSqlOptions,
): Promise<Buffer> => {
  const options = validateOptions(rawOptions)
  const [baseTemplate, configSegment, serverSegment] = await Promise.all([
    readTemplate('dl_adb_all.sql'),
    readTemplate('segment_config.sql'),
    renderServerSegment(options.channelCount),
  ])

  let sql = replaceSegment(baseTemplate, 'segment_config', configSegment)
  sql = replaceSegment(sql, 'segment_server', serverSegment)

  const replacements: Record<string, string> = {
    ZONE: escapeSqlString(options.zone),
  }

  for (const placeholder of ipPlaceholders) {
    replacements[placeholder] = options.ip
  }

  for (let index = 0; index < options.channelCount; index += 1) {
    replacements[`CHANNEL_${index + 1}_NAME`] = escapeSqlString(
      `${options.zone}${channelConfig.numerals[index]}线`,
    )
  }

  replacements.CHANNEL_ONE_NAME = replacements.CHANNEL_1_NAME
  replacements.CHANNEL_TWO_NAME = replacements.CHANNEL_2_NAME
  replacements.CHANNEL_THREE_NAME = replacements.CHANNEL_3_NAME

  sql = replaceAll(sql, replacements)

  const unresolvedPlaceholders = [...sql.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map(
    (match) => match[1],
  )

  if (unresolvedPlaceholders.length > 0) {
    throw new Error(
      `Unresolved SQL placeholders: ${[...new Set(unresolvedPlaceholders)].join(', ')}`,
    )
  }

  if (!sql.endsWith('\n')) sql += '\n'

  return iconv.encode(sql, TEMPLATE_ENCODING)
}
