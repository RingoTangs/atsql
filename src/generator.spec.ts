import type { Buffer } from 'node:buffer'
import type { GenerateSqlOptions } from './generator'
import iconv from 'iconv-lite'
import { describe, expect, it } from 'vitest'
import { channelConfig, channelCountErrorMessage } from './config'
import { generateSql, replaceSegment } from './generator'

const decode = (content: Buffer): string => iconv.decode(content, 'gb18030')

describe('generateSql', () => {
  it('generates only the configured ADB SQL with three channels by default', async () => {
    const sql = decode(
      await generateSql({ ip: '47.97.106.166', zone: '万里长城' }),
    )

    expect(sql).toContain(
      'CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dl_adb_all`',
    )
    expect(sql).not.toContain(
      'CREATE DATABASE /*!32312 IF NOT EXISTS*/ `dl_ddb_1`',
    )
    expect(sql.match(/^INSERT INTO `server`/gm)).toHaveLength(
      channelConfig.defaultCount,
    )
    expect(sql).toContain("VALUES ('万里长城一线','','47.97.106.166',8160")
    expect(sql).toContain("VALUES ('万里长城二线','','47.97.106.166',8161")
    expect(sql).toContain("VALUES ('万里长城三线','','47.97.106.166',8162")
    expect(sql).toContain(",600,1,'apex1'")
    expect(sql).toContain("'128.24.7.124',8110")
    expect(sql).not.toMatch(/\{\{[A-Z0-9_]+\}\}/)
    expect(sql).not.toContain('atsql:use:')
  })

  it('generates every configured channel up to the maximum', async () => {
    const sql = decode(
      await generateSql({
        ip: '47.97.106.166',
        zone: '万里长城',
        channelCount: channelConfig.maxCount,
      }),
    )

    expect(sql.match(/^INSERT INTO `server`/gm)).toHaveLength(
      channelConfig.maxCount,
    )
    expect(sql).toContain("VALUES ('万里长城四线','','47.97.106.166',8163")
    expect(sql).toContain(
      `VALUES ('万里长城十线','','47.97.106.166',${channelConfig.basePort + channelConfig.maxCount - 1}`,
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
      options: { ip: '47.97.106.166', zone: '  ' },
      message: 'Zone must not be empty',
    },
    {
      options: {
        ip: '47.97.106.166',
        zone: '万里长城',
        channelCount: channelConfig.minCount - 1,
      },
      message: `Channel count ${channelCountErrorMessage}`,
    },
    {
      options: {
        ip: '47.97.106.166',
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
