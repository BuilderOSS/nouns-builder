export type AppEnvironment = 'platform' | 'external' | 'test'

export const APP_ENV: AppEnvironment =
  typeof __BUILDEROSS_APP_ENV__ !== 'undefined' && !!__BUILDEROSS_APP_ENV__ ? __BUILDEROSS_APP_ENV__ : 'external'

export const isPlatform = APP_ENV === 'platform'
