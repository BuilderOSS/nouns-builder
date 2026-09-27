import {
  clearSafeInfo,
  type EIP1193Provider,
  getSavedSafeInfo,
  isOwnerOfSafe,
  type SafeInfo,
  SafeOwnerProvider,
  setSafeInfo,
} from '@buildeross/utils'
import { getConnectors } from '@wagmi/core'
import debug from 'debug'
import type { PublicClient } from 'viem'
import { createPublicClient, http } from 'viem'
import {
  type Config,
  type Connector,
  createConnector,
  type CreateConnectorFn,
} from 'wagmi'

const debugSafeConnector = debug('app:safe:connector')

createSafeOwnerConnector.type = 'safeOwner' as const

// Global reference to wagmi config (set after config is created)
let wagmiConfig: Config | null = null

export function setWagmiConfig(config: Config) {
  wagmiConfig = config
}

/**
 * Creates a static SafeOwnerConnector that reads Safe configuration from localStorage.
 * This connector works with wagmi's built-in persistence and reconnection system.
 *
 * Safe info (address, chainId, ownerConnectorId) is stored in localStorage and loaded on-demand.
 * The owner connector is discovered from wagmi's config by ID.
 */
export function createSafeOwnerConnector(): CreateConnectorFn {
  type Provider = SafeOwnerProvider | undefined
  type Properties = {
    safeInfo: SafeInfo | null
  }

  let provider_: Provider | undefined
  let safeInfo_: SafeInfo | null = null
  let publicClient_: PublicClient | null = null
  let ownerConnector_: Connector | null = null
  let ownerAddress_: `0x${string}` | null = null

  return createConnector<Provider, Properties>((config) => {
    /**
     * Load Safe configuration from localStorage
     */
    function loadSafeConfig() {
      return getSavedSafeInfo()
    }

    /**
     * Find the Safe owner connector by ID from wagmi config.
     */
    function findOwnerConnector(connectorId: string): Connector | null {
      if (!wagmiConfig) {
        console.error('[SafeOwnerConnector] wagmiConfig not initialized')
        return null
      }
      const connectors = getConnectors(wagmiConfig)
      return connectors.find((c: Connector) => c.id === connectorId) || null
    }

    /**
     * Clear cached state
     */
    function clearCache() {
      provider_ = undefined
      safeInfo_ = null
      publicClient_ = null
      ownerConnector_ = null
      ownerAddress_ = null
    }

    return {
      id: 'safeOwner',
      name: 'Safe',
      type: createSafeOwnerConnector.type,

      async setup() {
        // Called once when connector is initialized
        // We defer loading until needed for performance
      },

      /**
       * Check if this connector should auto-reconnect.
       * Returns true if:
       * 1. Safe info exists in localStorage
       * 2. Owner connector exists and is authorized
       * 3. Owner wallet is still a Safe owner
       */
      async isAuthorized() {
        debugSafeConnector('isAuthorized() called')
        try {
          const saved = loadSafeConfig()
          if (!saved) {
            debugSafeConnector('isAuthorized: No Safe config found')
            return false
          }

          debugSafeConnector('isAuthorized: Safe config loaded:', {
            safeAddress: saved.safeAddress,
            ownerConnectorId: saved.ownerConnectorId,
          })

          // Find the owner connector.
          const ownerConnector = findOwnerConnector(saved.ownerConnectorId)
          if (!ownerConnector) {
            debugSafeConnector(
              'isAuthorized: Owner connector not found:',
              saved.ownerConnectorId
            )
            return false
          }

          debugSafeConnector('isAuthorized: Found owner connector:', ownerConnector.id)

          // For WalletConnect, trigger provider initialization to restore session
          // This ensures the WalletConnect session is restored from storage before
          // checking authorization, avoiding race conditions during auto-reconnect
          if (
            ownerConnector.id === 'walletConnect' ||
            ownerConnector.id.includes('walletConnect')
          ) {
            debugSafeConnector(
              'isAuthorized: Detected WalletConnect, initializing provider...'
            )
            try {
              await ownerConnector.getProvider()
              debugSafeConnector(
                'isAuthorized: WalletConnect provider initialized successfully'
              )
            } catch (error) {
              debugSafeConnector(
                'isAuthorized: ERROR initializing WalletConnect provider:',
                error
              )
              // Provider init failed, can't auto-reconnect
              return false
            }
          }

          // Check if the owner connector is still authorized.
          debugSafeConnector('isAuthorized: Checking owner connector authorization...')
          const ownerAuthorized = await ownerConnector.isAuthorized()
          debugSafeConnector('isAuthorized: Owner connector authorized:', ownerAuthorized)
          if (!ownerAuthorized) {
            debugSafeConnector(
              'isAuthorized: Owner connector not authorized, clearing Safe info'
            )
            // Owner wallet is no longer authorized, clear stale Safe info.
            clearSafeInfo()
            return false
          }

          // Get owner wallet accounts.
          debugSafeConnector('isAuthorized: Getting owner wallet accounts...')
          const ownerAccounts = await ownerConnector.getAccounts()
          debugSafeConnector('isAuthorized: Owner accounts:', {
            count: ownerAccounts?.length ?? 0,
            firstAccount: ownerAccounts?.[0],
          })
          if (!ownerAccounts || ownerAccounts.length === 0) {
            debugSafeConnector(
              'isAuthorized: No owner accounts found, clearing Safe info'
            )
            clearSafeInfo()
            return false
          }

          // Verify the wallet is still a Safe owner.
          debugSafeConnector('isAuthorized: Verifying Safe ownership...')
          const isOwner = await isOwnerOfSafe(
            ownerAccounts[0],
            saved.safeAddress,
            saved.chainId
          )

          debugSafeConnector('isAuthorized: Safe ownership verified:', isOwner)
          if (!isOwner) {
            debugSafeConnector('isAuthorized: Not a Safe owner, clearing Safe info')
            // No longer an owner, clear stale Safe info
            clearSafeInfo()
            return false
          }

          debugSafeConnector('isAuthorized: All checks passed, returning true')
          return true
        } catch (error) {
          debugSafeConnector('isAuthorized: ERROR:', error)
          console.error('[SafeOwnerConnector] isAuthorized error:', error)
          return false
        }
      },

      /**
       * Connect method with type assertion for wagmi compatibility.
       *
       * Type assertion (as any) is necessary here due to TypeScript's limitation with
       * generic conditional types. wagmi expects:
       *   connect<withCapabilities extends boolean>(...)
       *   => Promise<{ accounts: withCapabilities extends true ? CapabilityAccount[] : Address[] }>
       *
       * This pattern is standard in wagmi core connectors.
       * The runtime behavior is correct - we return Address[] (Safe doesn't support EIP-5792).
       */
      connect: (async (_parameters?: {
        chainId?: number
        isReconnecting?: boolean
        withCapabilities?: boolean
      }) => {
        debugSafeConnector('Connecting SafeOwnerConnector...')
        const saved = loadSafeConfig()
        if (!saved) {
          throw new Error(
            'No Safe configuration found. Please connect via Safe mode first.'
          )
        }

        debugSafeConnector('Loaded Safe config:', {
          safeAddress: saved.safeAddress,
          chainId: saved.chainId,
          ownerConnectorId: saved.ownerConnectorId,
          ownerAddress: saved.ownerAddress || '(NOT SAVED)',
        })

        // Find and cache the owner connector.
        debugSafeConnector('Looking for owner connector:', saved.ownerConnectorId)
        ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
        if (!ownerConnector_) {
          if (wagmiConfig) {
            debugSafeConnector(
              'Owner connector not found. Available connectors:',
              getConnectors(wagmiConfig).map((c: Connector) => c.id)
            )
          }
          throw new Error(
            `Owner connector '${saved.ownerConnectorId}' not found. Please reconnect your wallet.`
          )
        }

        debugSafeConnector('Found owner connector:', ownerConnector_.id)

        // Get owner wallet accounts from wagmi's connection state
        // Don't call connector.getAccounts() as it internally calls getProvider(),
        // which triggers reconnect cycles that interfere with the connector state.
        // Instead, read accounts from wagmi's already-established connection state.
        debugSafeConnector('Getting owner wallet address from localStorage...')
        try {
          // The owner address is saved by the state machine before SafeOwnerConnector.connect()
          // is called. We just need to read it from the saved config.
          if (saved.ownerAddress) {
            ownerAddress_ = saved.ownerAddress as `0x${string}`
            debugSafeConnector(
              'Retrieved owner address from localStorage:',
              ownerAddress_
            )
          } else {
            // Fallback: if ownerAddress not in localStorage, try getAccounts() from connector
            // This handles edge cases where SafeOwnerConnector is reconnecting without re-validating
            debugSafeConnector(
              'Owner address not in localStorage, falling back to getAccounts()...'
            )
            const ownerAccounts = await ownerConnector_.getAccounts()
            debugSafeConnector('getAccounts() returned:', {
              count: ownerAccounts?.length ?? 0,
            })

            if (!ownerAccounts || ownerAccounts.length === 0) {
              throw new Error('Owner wallet did not return any accounts')
            }

            ownerAddress_ = ownerAccounts[0]
            debugSafeConnector('Retrieved owner address from connector:', ownerAddress_)
          }

          if (!ownerAddress_) {
            throw new Error('Failed to get owner wallet address')
          }
        } catch (error) {
          debugSafeConnector('ERROR getting owner address:', error)
          throw new Error(
            'Failed to get owner wallet accounts. ' +
              'Please ensure your wallet is connected and try again.'
          )
        }

        // Persist the resolved owner address so the signing UI can read it back later.
        debugSafeConnector('Calling setSafeInfo() with resolved owner address...', {
          safeAddress: saved.safeAddress,
          ownerConnectorId: saved.ownerConnectorId,
          ownerAddress: ownerAddress_,
        })

        setSafeInfo(
          {
            safeAddress: saved.safeAddress,
            chainId: saved.chainId,
            threshold: saved.threshold,
            owners: saved.owners,
            isReadOnly: false,
            nonce: saved.nonce,
            version: saved.version,
          },
          saved.ownerConnectorId,
          ownerAddress_
        )

        // Verify it was saved
        debugSafeConnector('Checking if SafeInfo was persisted to localStorage...')
        const saved_ = loadSafeConfig()
        debugSafeConnector('SafeInfo loaded from localStorage after save:', {
          safeAddress: saved_?.safeAddress,
          ownerConnectorId: saved_?.ownerConnectorId,
          ownerAddress: saved_?.ownerAddress || '(NOT SAVED)',
        })

        // Load Safe info from cache if not already loaded
        if (!safeInfo_) {
          // Use cached SafeInfo from localStorage (already fetched during validation)
          safeInfo_ = {
            safeAddress: saved.safeAddress,
            chainId: saved.chainId,
            threshold: saved.threshold,
            owners: saved.owners,
            isReadOnly: false,
            nonce: saved.nonce,
            version: saved.version,
          }
        }

        // Return Safe address as the connected account
        return {
          accounts: [saved.safeAddress],
          chainId: Number(saved.chainId),
        }
      }) as any,

      async disconnect() {
        // Clean up provider
        if (provider_) {
          provider_.destroy()
        }

        // Clear cached state
        clearCache()

        // Clear Safe info from storage
        clearSafeInfo()
      },

      async getAccounts() {
        const saved = loadSafeConfig()
        if (!saved) return []
        return [saved.safeAddress]
      },

      async getProvider() {
        debugSafeConnector('getProvider() called')
        const saved = loadSafeConfig()
        if (!saved) {
          throw new Error('No Safe configuration found')
        }

        debugSafeConnector('Checking if provider cache is still valid...')
        if (
          provider_ &&
          safeInfo_ &&
          (safeInfo_.safeAddress.toLowerCase() !== saved.safeAddress.toLowerCase() ||
            safeInfo_.chainId !== saved.chainId ||
            !ownerConnector_ ||
            ownerConnector_.id !== saved.ownerConnectorId)
        ) {
          debugSafeConnector('Provider cache invalid, clearing...')
          provider_.destroy()
          clearCache()
        }

        if (!provider_) {
          debugSafeConnector('Creating new SafeOwnerProvider...')
          // Get the owner connector.
          if (!ownerConnector_) {
            debugSafeConnector('Looking up owner connector:', saved.ownerConnectorId)
            ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
          }
          if (!ownerConnector_) {
            const errorMsg = `Owner connector '${saved.ownerConnectorId}' not found. This usually means the wallet was disconnected or the connector changed. Please disconnect and reconnect your wallet.`
            debugSafeConnector('ERROR: Owner connector not found')
            if (wagmiConfig) {
              const availableConnectors = getConnectors(wagmiConfig).map(
                (c: Connector) => c.id
              )
              debugSafeConnector('Available connectors:', availableConnectors)
              console.error(
                '[SafeOwnerConnector] Available connectors:',
                availableConnectors
              )
            }
            console.error('[SafeOwnerConnector]', errorMsg)
            throw new Error(errorMsg)
          }

          // Get the owner wallet provider.
          debugSafeConnector('Getting provider from owner connector:', ownerConnector_.id)
          const rawProvider = await ownerConnector_.getProvider()
          if (!rawProvider) {
            const errorMsg = `Failed to get provider from owner connector '${saved.ownerConnectorId}'. The wallet may not be fully initialized.`
            debugSafeConnector('ERROR:', errorMsg)
            console.error('[SafeOwnerConnector]', errorMsg)
            throw new Error(errorMsg)
          }

          debugSafeConnector('Successfully retrieved provider from owner connector')

          // Type assert to EIP1193Provider
          const ownerProvider = rawProvider as EIP1193Provider

          // Create public client if not already created
          if (!publicClient_) {
            debugSafeConnector('Creating public client for chain:', saved.chainId)
            const chain = config.chains.find((c) => c.id === saved.chainId)
            if (!chain) {
              throw new Error(`Chain ${saved.chainId} not found in wagmi config`)
            }

            publicClient_ = createPublicClient({
              chain,
              transport: http(),
            })
          }

          // ===== RESOLVE OWNER ADDRESS =====
          // Priority: 1) localStorage 2) in-memory cache 3) connector.getAccounts()
          // This is critical for SafeOwnerProvider to transform signing params
          debugSafeConnector('Resolving owner address...')
          let resolvedOwnerAddress = saved.ownerAddress
          debugSafeConnector('  - From localStorage:', resolvedOwnerAddress)

          if (!resolvedOwnerAddress && ownerAddress_) {
            resolvedOwnerAddress = ownerAddress_
            debugSafeConnector('  - From in-memory cache:', resolvedOwnerAddress)
          }

          // Only fetch from connector if we don't have it from localStorage or cache
          if (!resolvedOwnerAddress && ownerConnector_) {
            try {
              debugSafeConnector('  - Fetching from connector (fallback)...')
              const accounts = await ownerConnector_.getAccounts()
              if (accounts && accounts.length > 0) {
                resolvedOwnerAddress = accounts[0]
                // Cache it in memory for this session
                ownerAddress_ = resolvedOwnerAddress
                // Also save to localStorage for next session
                debugSafeConnector('  - Saving resolved address to localStorage')
                setSafeInfo(
                  {
                    safeAddress: saved.safeAddress,
                    chainId: saved.chainId,
                    threshold: saved.threshold,
                    owners: saved.owners,
                    isReadOnly: false,
                    nonce: saved.nonce,
                    version: saved.version,
                  },
                  saved.ownerConnectorId,
                  resolvedOwnerAddress
                )
                debugSafeConnector('  - Retrieved from connector:', resolvedOwnerAddress)
              }
            } catch (error) {
              debugSafeConnector('  - Failed to get from connector:', error)
              console.warn(
                '[SafeOwnerConnector] Failed to get owner address from connector:',
                error
              )
            }
          }

          debugSafeConnector('  - Final resolved address:', resolvedOwnerAddress)

          // VALIDATE: Owner address is required for SafeOwnerProvider to work
          if (!resolvedOwnerAddress) {
            const errorMsg =
              'Cannot create Safe provider: owner address is not available. ' +
              'This usually means the owner wallet was disconnected. ' +
              'Please disconnect the Safe and reconnect with your wallet.'
            debugSafeConnector('ERROR: No owner address available!')
            console.error('[SafeOwnerConnector]', errorMsg)
            throw new Error(errorMsg)
          }

          // ===== BUILD OR UPDATE SAFEINFO =====
          if (!safeInfo_) {
            debugSafeConnector('Building new SafeInfo...')
            safeInfo_ = {
              safeAddress: saved.safeAddress,
              chainId: saved.chainId,
              threshold: saved.threshold,
              owners: saved.owners,
              isReadOnly: false,
              nonce: saved.nonce,
              version: saved.version,
              ownerAddress: resolvedOwnerAddress,
            }
            debugSafeConnector('SafeInfo created:', {
              safeAddress: safeInfo_.safeAddress,
              chainId: safeInfo_.chainId,
              ownerAddress: safeInfo_.ownerAddress,
            })
          } else if (!safeInfo_.ownerAddress) {
            // Update existing safeInfo if it's missing ownerAddress
            debugSafeConnector('Updating existing SafeInfo with owner address...')
            safeInfo_ = {
              ...safeInfo_,
              ownerAddress: resolvedOwnerAddress,
            }
            debugSafeConnector('SafeInfo updated:', {
              safeAddress: safeInfo_.safeAddress,
              chainId: safeInfo_.chainId,
              ownerAddress: safeInfo_.ownerAddress,
            })
          }

          // Create SafeOwnerProvider
          debugSafeConnector('Creating new SafeOwnerProvider instance')
          provider_ = new SafeOwnerProvider(safeInfo_, ownerProvider, publicClient_)
          debugSafeConnector('SafeOwnerProvider created successfully')
        }

        return provider_
      },

      async getChainId() {
        const saved = loadSafeConfig()
        if (!saved) {
          throw new Error('No Safe configuration found')
        }
        return saved.chainId
      },

      async switchChain({ chainId: newChainId }) {
        const saved = loadSafeConfig()
        if (!saved) {
          throw new Error('No Safe configuration found')
        }

        // Safes are chain-specific contracts - cannot switch chains
        if (newChainId !== saved.chainId) {
          throw new Error(
            'Cannot switch chain for Safe. Safes are chain-specific smart contracts.'
          )
        }

        return config.chains.find((c) => c.id === saved.chainId)!
      },

      onAccountsChanged(_accounts) {
        const saved = loadSafeConfig()
        if (saved) {
          // Owner accounts changed, but we still report the Safe address.
          config.emitter.emit('change', { accounts: [saved.safeAddress] })
        }
      },

      onChainChanged(newChainId) {
        const saved = loadSafeConfig()
        if (saved && Number(newChainId) !== saved.chainId) {
          // Safe is on a different chain, disconnect
          config.emitter.emit('disconnect')
        }
      },

      onDisconnect() {
        if (provider_) {
          provider_.destroy()
        }
        clearCache()
        clearSafeInfo()
        config.emitter.emit('disconnect')
      },

      // Custom property to expose Safe info
      get safeInfo() {
        // Lazily load from localStorage if not already cached
        if (!safeInfo_) {
          const saved = loadSafeConfig()
          if (saved) {
            safeInfo_ = {
              safeAddress: saved.safeAddress,
              chainId: saved.chainId,
              threshold: saved.threshold,
              owners: saved.owners,
              isReadOnly: false,
              nonce: saved.nonce,
              version: saved.version,
            }
          }
        }
        return safeInfo_
      },

      // Synchronous getter for the cached owner connector.
      get cachedOwnerConnector(): Connector | null {
        return ownerConnector_
      },

      // Synchronous getter for the cached owner address.
      get cachedOwnerAddress(): `0x${string}` | null {
        return ownerAddress_ ?? loadSafeConfig()?.ownerAddress ?? null
      },

      // Custom method to get the owner connector.
      async getOwnerConnector(): Promise<Connector | null> {
        const saved = loadSafeConfig()
        if (!saved) return null

        if (!ownerConnector_) {
          ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
        }
        if (!ownerConnector_) return null
        return ownerConnector_
      },

      // Custom method to get the owner address for signing.
      async getOwnerAddress(): Promise<`0x${string}` | null> {
        const saved = loadSafeConfig()
        if (!saved) return null

        if (!ownerConnector_) {
          ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
        }
        const ownerConnector = ownerConnector_
        const ownerAddress = ownerConnector
          ? (await ownerConnector.getAccounts())?.[0]
          : null
        if (ownerAddress) {
          ownerAddress_ = ownerAddress
          return ownerAddress
        }

        if (saved.ownerAddress) {
          ownerAddress_ = saved.ownerAddress
          return saved.ownerAddress
        }

        return null
      },
    }
  })
}
