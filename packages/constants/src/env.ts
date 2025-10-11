export type AppEnvironment = 'platform' | 'external' | 'test'

const VALID_APP_ENVS: AppEnvironment[] = ['platform', 'external', 'test']

const NODE_ENV = process.env.NODE_ENV

const BUILDEROSS_APP_ENV = process.env.BUILDEROSS_APP_ENV

/**
 * Resolves the BuilderOSS App Environment.
 *
 * Resolution order:
 * 1. __BUILDEROSS_APP_ENV__ (build-time constant)
 * 2. process.env.BUILDEROSS_APP_ENV (runtime override, validated)
 * 3. "external" (fallback)
 */
function resolveAppEnv(): AppEnvironment {
  // Prefer the build-time injected constant
  if (typeof __BUILDEROSS_APP_ENV__ !== 'undefined' && !!__BUILDEROSS_APP_ENV__) {
    return __BUILDEROSS_APP_ENV__
  }

  // Validate the runtime override (if provided)
  const runtimeEnv = BUILDEROSS_APP_ENV

  if (runtimeEnv) {
    if (VALID_APP_ENVS.includes(runtimeEnv as AppEnvironment)) {
      return runtimeEnv as AppEnvironment
    }

    // Optional: strict vs soft behavior
    if (NODE_ENV !== 'production') {
      console.warn(
        `[buildeross:constants] Invalid BUILDEROSS_APP_ENV "${runtimeEnv}". Expected one of: ${VALID_APP_ENVS.join(', ')}. Falling back to "external".`
      )
    }

    return 'external'
  }

  // Default fallback
  return 'external'
}

export const APP_ENV: AppEnvironment = resolveAppEnv()

// Convenience helpers
export const isPlatform = APP_ENV === 'platform'
export const isExternal = APP_ENV === 'external'
export const isTest = APP_ENV === 'test'
