import {
  clearSafeInfo,
  type EIP1193Provider,
  getSavedSafeInfo,
  isOwnerOfSafe,
  type SafeInfo,
  SafeOwnerProvider,
} from '@buildeross/utils'
import { getSafeInfo as getSafeInfoFromChain } from '@buildeross/utils/safeService'
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
 * Safe info (address, chainId, eoaConnectorId) is stored in localStorage and loaded on-demand.
 * The EOA connector is discovered from wagmi's config by ID.
 */
export function createSafeOwnerConnector(): CreateConnectorFn {
  type Provider = SafeOwnerProvider | undefined
  type Properties = {
    safeInfo: SafeInfo | null
  }

  let provider_: Provider | undefined
  let safeInfo_: SafeInfo | null = null
  let publicClient_: PublicClient | null = null
  let eoaConnector_: Connector | null = null

  return createConnector<Provider, Properties>((config) => {
    /**
     * Load Safe configuration from localStorage
     */
    function loadSafeConfig() {
      return getSavedSafeInfo()
    }

    /**
     * Find EOA connector by ID from wagmi config
     */
    function findEOAConnector(connectorId: string): Connector | null {
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
      eoaConnector_ = null
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
       * 2. EOA connector exists and is authorized
       * 3. EOA is still a Safe owner
       */
      async isAuthorized() {
        try {
          const saved = loadSafeConfig()
          if (!saved) return false

          // Find the EOA connector
          const eoaConnector = findEOAConnector(saved.eoaConnectorId)
          if (!eoaConnector) return false

          // Check if EOA connector is still authorized
          const eoaAuthorized = await eoaConnector.isAuthorized()
          if (!eoaAuthorized) {
            // EOA no longer authorized, clear stale Safe info
            clearSafeInfo()
            return false
          }

          // Get EOA accounts
          const eoaAccounts = await eoaConnector.getAccounts()
          if (!eoaAccounts || eoaAccounts.length === 0) {
            clearSafeInfo()
            return false
          }

          // Verify EOA is still a Safe owner
          const isOwner = await isOwnerOfSafe(
            eoaAccounts[0],
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

        // Find and cache EOA connector
        eoaConnector_ = findEOAConnector(saved.eoaConnectorId)
        if (!eoaConnector_) {
          throw new Error(
            `EOA connector '${saved.eoaConnectorId}' not found. Please reconnect your wallet.`
          )
        }

        // Verify EOA connector is authorized (should be true from isAuthorized check)
        const eoaAuthorized = await eoaConnector_.isAuthorized()
        if (!eoaAuthorized) {
          throw new Error('EOA wallet is not authorized. Please reconnect.')
        }

        // Fetch Safe info if not already loaded
        if (!safeInfo_) {
          try {
            safeInfo_ = await getSafeInfoFromChain(saved.safeAddress, saved.chainId)
          } catch (error) {
            console.error('[SafeOwnerConnector] Failed to fetch Safe info:', error)
            throw new Error('Failed to load Safe information')
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
          provider_.removeAllListeners()
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

        if (!provider_) {
          // Get EOA connector
          if (!eoaConnector_) {
            eoaConnector_ = findEOAConnector(saved.eoaConnectorId)
          }
          if (!eoaConnector_) {
            throw new ProviderNotFoundError()
          }

          // Get EOA provider
          const rawProvider = await eoaConnector_.getProvider()
          if (!rawProvider) {
            throw new ProviderNotFoundError()
          }

          // Type assert to EIP1193Provider
          const eoaProvider = rawProvider as EIP1193Provider

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
            safeInfo_ = await getSafeInfoFromChain(saved.safeAddress, saved.chainId)
          }

          if (!safeInfo_) {
            throw new Error('Failed to fetch Safe info')
          }

          // Create SafeOwnerProvider
          provider_ = new SafeOwnerProvider(safeInfo_, eoaProvider, publicClient_)
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
          // EOA accounts changed, but we still report Safe address
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
        clearCache()
        clearSafeInfo()
        config.emitter.emit('disconnect')
      },

      // Custom property to expose Safe info
      get safeInfo() {
        return safeInfo_
      },

      // Custom method to get EOA address for signing
      async getEOAAddress() {
        const saved = loadSafeConfig()
        if (!saved) return null

        if (!eoaConnector_) {
          eoaConnector_ = findEOAConnector(saved.eoaConnectorId)
        }
        if (!eoaConnector_) return null

        const eoaAccounts = await eoaConnector_.getAccounts()
        return eoaAccounts?.[0] || null
      },
    }
  })
}
