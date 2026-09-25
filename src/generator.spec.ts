import type { GenerateSqlOptions } from './generator'
import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import iconv from 'iconv-lite'
import { describe, expect, it } from 'vitest'
import {
  channelConfig,
  channelCountErrorMessage,
  databaseTemplateNames,
} from './config'
import { generateSql, replaceSegment } from './generator'

const decode = (content: Buffer): string => iconv.decode(content, 'gb18030')
const testIp = '127.0.0.1'

describe('generateSql', () => {
  it('generates every database in template order with three channels by default', async () => {
    const sql = decode(await generateSql({ ip: testIp, zone: '万里长城' }))

    const databaseNames = databaseTemplateNames.map((name) =>
      name.replace(/\.sql$/, ''),
    )
    const databaseIndexes = databaseNames.map((name) =>
      sql.indexOf(`CREATE DATABASE /*!32312 IF NOT EXISTS*/ \`${name}\``),
    )

    expect(databaseIndexes.every((index) => index !== -1)).toBe(true)
    expect(databaseIndexes).toEqual([...databaseIndexes].sort((a, b) => a - b))
    expect(sql.match(/^CREATE DATABASE /gm)).toHaveLength(
      databaseTemplateNames.length,
    )
    expect(sql.match(/^INSERT INTO `server`/gm)).toHaveLength(
      channelConfig.defaultCount,
    )
    expect(sql).toContain(`VALUES ('万里长城一线','','${testIp}',8160`)
    expect(sql).toContain(`VALUES ('万里长城二线','','${testIp}',8161`)
    expect(sql).toContain(`VALUES ('万里长城三线','','${testIp}',8162`)
    expect(sql).toContain(",600,1,'apex1'")
    expect(sql).toContain("'128.24.7.124',8110")
    expect(sql).not.toMatch(/\{\{[A-Z0-9_]+\}\}/)
    expect(sql).not.toContain('atsql:use:')
  })

  it('wraps all database bodies in one mysqldump session', async () => {
    const sql = decode(await generateSql({ ip: testIp, zone: '万里长城' }))
    const lockCount = sql.match(/^LOCK TABLES /gm)?.length ?? 0
    const unlockCount = sql.match(/^UNLOCK TABLES;/gm)?.length ?? 0

    expect(sql.match(/^-- MySQL dump /gm)).toHaveLength(1)
    expect(sql.match(/^-- Dump completed /gm)).toHaveLength(1)
    expect(sql.match(/SET @OLD_TIME_ZONE=@@TIME_ZONE/g)).toHaveLength(1)
    expect(sql.match(/SET TIME_ZONE=@OLD_TIME_ZONE/g)).toHaveLength(1)
    expect(sql.match(/SET @OLD_SQL_MODE=@@SQL_MODE/g)).toHaveLength(1)
    expect(sql.match(/SET SQL_MODE=@OLD_SQL_MODE/g)).toHaveLength(1)
    expect(lockCount).toBeGreaterThan(0)
    expect(unlockCount).toBe(lockCount)
  })

  it('preserves every schema dump body byte for byte', async () => {
    const sql = await generateSql({
      ip: testIp,
      zone: '万里长城',
    })
    const headerEndMarker = Buffer.from(
      '/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;',
    )
    const footerStartMarker = Buffer.from(
      '/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;',
    )

    for (const templateName of databaseTemplateNames.slice(1)) {
      const template = await readFile(
        new URL(`../sqls/awaiting-use/${templateName}`, import.meta.url),
      )
      const headerMarkerIndex = template.indexOf(headerEndMarker)
      const bodyStartIndex = template.indexOf(0x0a, headerMarkerIndex) + 1
      const footerStartIndex = template.indexOf(footerStartMarker)
      const body = template.subarray(bodyStartIndex, footerStartIndex)

      expect(sql.indexOf(body), templateName).toBeGreaterThanOrEqual(0)
    }
  })

  it('generates every configured channel up to the maximum', async () => {
    const sql = decode(
      await generateSql({
        ip: testIp,
        zone: '万里长城',
        channelCount: channelConfig.maxCount,
      }),
    )

    expect(sql.match(/^INSERT INTO `server`/gm)).toHaveLength(
      channelConfig.maxCount,
    )
    expect(sql).toContain(`VALUES ('万里长城四线','','${testIp}',8163`)
    expect(sql).toContain(
      `VALUES ('万里长城十线','','${testIp}',${channelConfig.basePort + channelConfig.maxCount - 1}`,
    )
    expect(sql).toContain(
      `,0,0,0,0,${channelConfig.maxCount},'','','',0,NULL);`,
    )
    expect(sql).not.toContain('万里长城四线:')
    expect(sql.match(/^INSERT INTO `config`/gm)).toHaveLength(39)
  })

  it.each<{ message: string; options: GenerateSqlOptions }>([
    {
      options: { ip: 'not-an-ip', zone: '万里长城' },
      message: 'Invalid IPv4 address',
    },
    {
      options: { ip: testIp, zone: '  ' },
      message: 'Zone must not be empty',
    },
    {
      options: {
        ip: testIp,
        zone: '万里长城',
        channelCount: channelConfig.minCount - 1,
      },
      message: `Channel count ${channelCountErrorMessage}`,
    },
    {
      options: {
        ip: testIp,
        zone: '万里长城',
        channelCount: channelConfig.maxCount + 1,
      },
      message: `Channel count ${channelCountErrorMessage}`,
    },
  ])('rejects invalid options: $message', async ({ options, message }) => {
    await expect(generateSql(options)).rejects.toThrow(message)
  })
})

describe('replaceSegment', () => {
  it('replaces exactly one template marker', () => {
    expect(
      replaceSegment(
        'before\n-- atsql:use:segment_config\nafter',
        'segment_config',
        'INSERT INTO `config` VALUES ();\n',
      ),
    ).toBe('before\nINSERT INTO `config` VALUES ();\nafter')
  })

  it.each([
    ['a template without the marker'],
    ['-- atsql:use:segment_config\n-- atsql:use:segment_config'],
  ])('rejects a missing or duplicated marker', (template) => {
    expect(() =>
      replaceSegment(template, 'segment_config', 'INSERT INTO `config`;'),
    ).toThrow('Expected exactly one -- atsql:use:segment_config marker')
  })
})
