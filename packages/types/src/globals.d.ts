// Global type declarations for @buildeross/types
// This file should be included in TypeScript projects that need these global types

// for environment variables
declare const __BUILDEROSS_APP_ENV__: 'platform' | 'external' | 'test'

// for app base url
declare const __BUILDEROSS_BASE_URL__: string

// for markdown files
declare module '*.md' {
  const content: string
  export default content
}
