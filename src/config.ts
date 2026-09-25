const channelNumerals = [
  '一',
  '二',
  '三',
  '四',
  '五',
  '六',
  '七',
  '八',
  '九',
  '十',
] as const

export const databaseTemplateNames = [
  'dl_adb_all.sql',
  'dl_ddb_1.sql',
  'dl_dmdb_1.sql',
  'dl_ldb_1.sql',
  'dl_ldb_all.sql',
  'dl_mdb_1.sql',
  'dl_mdb_all.sql',
  'dl_tdb_1.sql',
] as const

export const channelConfig = {
  defaultCount: 3,
  minCount: 3,
  maxCount: channelNumerals.length,
  basePort: 8160,
  numerals: channelNumerals,
} as const

export const channelCountRange = `${channelConfig.minCount}-${channelConfig.maxCount}`

export const channelCountErrorMessage = `must be an integer between ${channelConfig.minCount} and ${channelConfig.maxCount}`

export const isValidChannelCount = (value: number): boolean =>
  Number.isInteger(value) &&
  value >= channelConfig.minCount &&
  value <= channelConfig.maxCount
