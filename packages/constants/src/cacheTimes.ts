const ONE_MINUTE = 60
const ONE_HOUR = ONE_MINUTE * 60
const ONE_DAY = ONE_HOUR * 24
const ONE_WEEK = ONE_DAY * 7

export const CACHE_TIMES = {
  DAO_INFO: {
    maxAge: ONE_MINUTE,
    swr: ONE_DAY,
  },
  DAO_PROPOSAL: {
    maxAge: ONE_MINUTE,
    swr: ONE_DAY,
  },
  TOKEN_INFO: {
    maxAge: ONE_MINUTE,
    swr: ONE_DAY,
  },
  EXPLORE: {
    maxAge: ONE_MINUTE,
    swr: ONE_HOUR,
  },
  IN_PROGRESS_PROPOSAL: {
    maxAge: ONE_MINUTE,
    swr: ONE_HOUR,
  },
  SETTLED_PROPOSAL: {
    maxAge: ONE_DAY,
    swr: ONE_WEEK,
  },
  DECODE: {
    maxAge: ONE_DAY,
    swr: ONE_WEEK,
  },
  DAO_FEED: {
    maxAge: ONE_MINUTE,
    swr: ONE_HOUR,
  },
  PROFILE: {
    maxAge: ONE_DAY,
    swr: ONE_WEEK,
  },
  RENDERER: {
    maxAge: ONE_DAY,
    swr: ONE_WEEK,
  },
}
