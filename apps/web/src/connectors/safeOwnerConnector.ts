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
import type { PublicClient } from 'viem'
import { createPublicClient, http } from 'viem'
import {
  type Config,
  type Connector,
  createConnector,
  type CreateConnectorFn,
  ProviderNotFoundError,
} from 'wagmi'

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
        try {
          const saved = loadSafeConfig()
          if (!saved) return false

          // Find the owner connector.
          const ownerConnector = findOwnerConnector(saved.ownerConnectorId)
          if (!ownerConnector) return false

          // Check if the owner connector is still authorized.
          const ownerAuthorized = await ownerConnector.isAuthorized()
          if (!ownerAuthorized) {
            // Owner wallet is no longer authorized, clear stale Safe info.
            clearSafeInfo()
            return false
          }

          // Get owner wallet accounts.
          const ownerAccounts = await ownerConnector.getAccounts()
          if (!ownerAccounts || ownerAccounts.length === 0) {
            clearSafeInfo()
            return false
          }

          // Verify the wallet is still a Safe owner.
          const isOwner = await isOwnerOfSafe(
            ownerAccounts[0],
            saved.safeAddress,
            saved.chainId
          )

          if (!isOwner) {
            // No longer an owner, clear stale Safe info
            clearSafeInfo()
            return false
          }

          return true
        } catch (error) {
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
        const saved = loadSafeConfig()
        if (!saved) {
          throw new Error(
            'No Safe configuration found. Please connect via Safe mode first.'
          )
        }

        // Find and cache the owner connector.
        ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
        if (!ownerConnector_) {
          throw new Error(
            `Owner connector '${saved.ownerConnectorId}' not found. Please reconnect your wallet.`
          )
        }

        // Verify the owner connector is authorized (should be true from isAuthorized check).
        const ownerAuthorized = await ownerConnector_.isAuthorized()
        if (!ownerAuthorized) {
          throw new Error('Safe owner wallet is not authorized. Please reconnect.')
        }

        // Cache the owner address for synchronous access.
        const ownerAccounts = await ownerConnector_.getAccounts()
        ownerAddress_ = ownerAccounts?.[0] || null

        // Persist the resolved owner address so the signing UI can read it back later.
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
        const saved = loadSafeConfig()
        if (!saved) {
          throw new Error('No Safe configuration found')
        }

        if (
          provider_ &&
          safeInfo_ &&
          (safeInfo_.safeAddress.toLowerCase() !== saved.safeAddress.toLowerCase() ||
            safeInfo_.chainId !== saved.chainId ||
            !ownerConnector_ ||
            ownerConnector_.id !== saved.ownerConnectorId)
        ) {
          provider_.destroy()
          clearCache()
        }

        if (!provider_) {
          // Get the owner connector.
          if (!ownerConnector_) {
            ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
          }
          if (!ownerConnector_) {
            throw new ProviderNotFoundError()
          }

          // Get the owner wallet provider.
          const rawProvider = await ownerConnector_.getProvider()
          if (!rawProvider) {
            throw new ProviderNotFoundError()
          }

          // Type assert to EIP1193Provider
          const ownerProvider = rawProvider as EIP1193Provider

          // Create public client if not already created
          if (!publicClient_) {
            const chain = config.chains.find((c) => c.id === saved.chainId)
            if (!chain) {
              throw new Error(`Chain ${saved.chainId} not found in wagmi config`)
            }

            publicClient_ = createPublicClient({
              chain,
              transport: http(),
            })
          }

          // Ensure we have Safe info
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

          // Create SafeOwnerProvider
          provider_ = new SafeOwnerProvider(safeInfo_, ownerProvider, publicClient_)
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

        if (saved.ownerAddress) {
          ownerAddress_ = saved.ownerAddress
          return saved.ownerAddress
        }

        if (!ownerConnector_) {
          ownerConnector_ = findOwnerConnector(saved.ownerConnectorId)
        }
        if (!ownerConnector_) return null

        const ownerAccounts = await ownerConnector_.getAccounts()
        return ownerAccounts?.[0] || null
      },
    }
  })
}
