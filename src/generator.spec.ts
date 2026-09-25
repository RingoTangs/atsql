import type { Buffer } from 'node:buffer'
import type { GenerateSqlOptions } from './generator'

import iconv from 'iconv-lite'
import { describe, expect, it } from 'vitest'

import { generateSql } from './generator'

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
    expect(sql.match(/^INSERT INTO `server`/gm)).toHaveLength(3)
    expect(sql).toContain("VALUES ('万里长城一线','','47.97.106.166',8160")
    expect(sql).toContain("VALUES ('万里长城二线','','47.97.106.166',8161")
    expect(sql).toContain("VALUES ('万里长城三线','','47.97.106.166',8162")
    expect(sql).toContain(",600,1,'apex1'")
    expect(sql).toContain("'128.24.7.124',8110")
    expect(sql).not.toMatch(/\{\{[A-Z0-9_]+\}\}/)
    expect(sql).not.toContain('atsql:use:')
  })

  it('adds regular server rows for channels four through ten', async () => {
    const sql = decode(
      await generateSql({
        ip: '47.97.106.166',
        zone: '万里长城',
        channelCount: 5,
      }),
    )

    expect(sql.match(/^INSERT INTO `server`/gm)).toHaveLength(5)
    expect(sql).toContain("VALUES ('万里长城四线','','47.97.106.166',8163")
    expect(sql).toContain("VALUES ('万里长城五线','','47.97.106.166',8164")
    expect(sql).toContain(",0,0,0,0,5,'','','',0,NULL);")
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
      options: { ip: '47.97.106.166', zone: '万里长城', channelCount: 2 },
      message: 'Channel count must be an integer between 3 and 10',
    },
    {
      options: { ip: '47.97.106.166', zone: '万里长城', channelCount: 11 },
      message: 'Channel count must be an integer between 3 and 10',
    },
  ])('rejects invalid options: $message', async ({ options, message }) => {
    await expect(generateSql(options)).rejects.toThrow(message)
  })
})
