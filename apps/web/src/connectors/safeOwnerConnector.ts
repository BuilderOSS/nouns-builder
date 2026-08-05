import { CHAIN_ID } from '@buildeross/types'
import {
  type EIP1193Provider,
  getSafeInfo,
  isOwnerOfSafe,
  type SafeInfo,
  SafeOwnerProvider,
} from '@buildeross/utils'
import type { Address, PublicClient } from 'viem'
import { createPublicClient, http } from 'viem'
import {
  type Connector,
  createConnector,
  type CreateConnectorFn,
  ProviderNotFoundError,
} from 'wagmi'

export interface SafeOwnerParameters {
  safeAddress: Address
  chainId: CHAIN_ID
  eoaConnector: Connector
}

safeOwnerConnector.type = 'safeOwner' as const

export function safeOwnerConnector(parameters: SafeOwnerParameters): CreateConnectorFn {
  const { safeAddress, chainId, eoaConnector } = parameters

  type Provider = SafeOwnerProvider | undefined
  type Properties = {
    safeInfo: SafeInfo | null
  }

  let provider_: Provider | undefined
  let safeInfo_: SafeInfo | null = null
  let publicClient_: PublicClient | null = null

  return createConnector<Provider, Properties>((config) => ({
    id: 'safeOwner',
    name: `Safe (${safeAddress.slice(0, 6)}...${safeAddress.slice(-4)})`,
    type: safeOwnerConnector.type,

    async setup() {
      // Fetch Safe info during setup
      try {
        safeInfo_ = await getSafeInfo(safeAddress, chainId)
      } catch (error) {
        console.error('Failed to fetch Safe info:', error)
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
     * The issue: TypeScript cannot verify that runtime branching (if/else) matches
     * compile-time conditional types (withCapabilities extends true ? X : Y).
     * This is a known limitation - conditional generic types are resolved at compile-time,
     * while our implementation logic executes at runtime.
     *
     * This pattern is standard in wagmi core connectors for the same reason.
     * The runtime behavior is correct - we return Address[] (Safe doesn't support EIP-5792
     * wallet capabilities), which satisfies the interface contract.
     */
    connect: (async (_parameters?: {
      chainId?: number
      isReconnecting?: boolean
      withCapabilities?: boolean
    }) => {
      // Note: We don't call eoaConnector.connect() here because the EOA is already
      // connected when this Safe connector is created. Calling connect() again would
      // prompt the user for wallet approval a second time.

      // Verify EOA is still authorized
      const isAuthorized = await eoaConnector.isAuthorized()
      if (!isAuthorized) {
        throw new Error('EOA wallet is not authorized. Please reconnect.')
      }

      // Fetch Safe info if not already loaded
      if (!safeInfo_) {
        safeInfo_ = await getSafeInfo(safeAddress, chainId)
      }

      // Return Safe address as the connected account
      // Note: We don't implement withCapabilities since Safe doesn't support EIP-5792
      return {
        accounts: [safeAddress],
        chainId: Number(chainId),
      }
    }) as any,

    async disconnect() {
      // Clean up provider
      if (provider_) {
        provider_.removeAllListeners()
        provider_ = undefined
      }

      // Optionally disconnect EOA connector
      // await eoaConnector.disconnect()
    },

    async getAccounts() {
      // Always return Safe address
      return [safeAddress]
    },

    async getProvider() {
      if (!provider_) {
        // Get EOA provider
        const rawProvider = await eoaConnector.getProvider()
        if (!rawProvider) {
          throw new ProviderNotFoundError()
        }

        // Type assert to EIP1193Provider (all wallet providers implement this)
        const eoaProvider = rawProvider as EIP1193Provider

        // Create public client if not already created
        if (!publicClient_) {
          // Find the chain from config
          const chain = config.chains.find((c) => c.id === chainId)
          if (!chain) {
            throw new Error(`Chain ${chainId} not found in wagmi config`)
          }

          // Create public client using viem
          publicClient_ = createPublicClient({
            chain,
            transport: http(),
          })
        }

        // Ensure we have Safe info
        if (!safeInfo_) {
          safeInfo_ = await getSafeInfo(safeAddress, chainId)
        }

        // Verify we have Safe info before creating provider
        if (!safeInfo_) {
          throw new Error('Failed to fetch Safe info')
        }

        // Create SafeOwnerProvider
        provider_ = new SafeOwnerProvider(safeInfo_, eoaProvider, publicClient_)
      }

      return provider_
    },

    async getChainId() {
      return chainId
    },

    async isAuthorized() {
      try {
        // Check if EOA connector is still authorized
        const eoaAuthorized = await eoaConnector.isAuthorized()
        if (!eoaAuthorized) return false

        // Check if EOA is still an owner of the Safe
        const eoaAccounts = await eoaConnector.getAccounts()
        if (!eoaAccounts || eoaAccounts.length === 0) return false

        const isOwner = await isOwnerOfSafe(eoaAccounts[0], safeAddress, chainId)
        return isOwner
      } catch {
        return false
      }
    },

    async switchChain({ chainId: newChainId }) {
      // Safes are chain-specific contracts
      // Cannot switch to different chain
      if (newChainId !== chainId) {
        throw new Error(
          'Cannot switch chain for Safe. Safes are chain-specific smart contracts.'
        )
      }

      return config.chains.find((c) => c.id === chainId)!
    },

    onAccountsChanged(_accounts) {
      // EOA accounts changed, but we still report Safe address
      config.emitter.emit('change', { accounts: [safeAddress] })
    },

    onChainChanged(newChainId) {
      // Safes don't change chains
      // If EOA chain changed, we may need to disconnect
      if (Number(newChainId) !== chainId) {
        config.emitter.emit('disconnect')
      }
    },

    onDisconnect() {
      config.emitter.emit('disconnect')
    },

    // Custom property to expose Safe info
    get safeInfo() {
      return safeInfo_
    },

    // Custom method to get EOA address for signing
    async getEOAAddress() {
      const eoaAccounts = await eoaConnector.getAccounts()
      return eoaAccounts?.[0] || null
    },
  }))
}
