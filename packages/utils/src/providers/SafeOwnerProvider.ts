import { EventEmitter } from 'events'
import type { PublicClient } from 'viem'

import type {
  CallParams,
  EIP1193Provider,
  SafeInfo,
  SendTransactionParams,
} from './types'

/**
 * Custom EIP-1193 provider that presents a Safe as the connected account
 * while delegating signing operations to an EOA wallet.
 *
 * Based on @safe-global/safe-apps-provider but works outside iframe context.
 */
export class SafeOwnerProvider extends EventEmitter implements EIP1193Provider {
  private readonly safe: SafeInfo
  private readonly eoaProvider: EIP1193Provider
  private readonly publicClient: PublicClient

  constructor(safe: SafeInfo, eoaProvider: EIP1193Provider, publicClient: PublicClient) {
    super()
    this.safe = safe
    this.eoaProvider = eoaProvider
    this.publicClient = publicClient

    // Forward events from EOA provider
    this.setupEventForwarding()
  }

  private setupEventForwarding(): void {
    // Forward certain events from EOA provider, but modify accounts
    const originalOn = this.eoaProvider.on.bind(this.eoaProvider)

    // Listen to EOA provider events
    if (originalOn) {
      originalOn('accountsChanged', (..._args: unknown[]) => {
        // EOA changed, but we still report Safe address
        this.emit('accountsChanged', [this.safe.safeAddress])
      })

      originalOn('chainChanged', (...args: unknown[]) => {
        // Forward chain changes
        const [chainId] = args
        this.emit('chainChanged', chainId as string)
      })

      originalOn('disconnect', () => {
        this.emit('disconnect')
      })
    }
  }

  get chainId(): number {
    return this.safe.chainId
  }

  async request(request: {
    method: string
    params?: unknown[] | Record<string, unknown>
  }): Promise<unknown> {
    const { method, params = [] } = request
    const paramsArray = Array.isArray(params) ? params : []

    switch (method) {
      // Account management - return Safe address
      case 'eth_accounts':
      case 'eth_requestAccounts':
        return [this.safe.safeAddress]

      // Chain info - return Safe's chain
      case 'eth_chainId':
        return this.numberToHex(this.safe.chainId)

      case 'net_version':
        return String(this.safe.chainId)

      // Signing methods - delegate to EOA for SIWE authentication
      case 'personal_sign':
      case 'eth_sign':
      case 'eth_signTypedData':
      case 'eth_signTypedData_v3':
      case 'eth_signTypedData_v4': {
        // Delegate signing to EOA provider
        // Need to replace Safe address with EOA address in params
        console.log('[SafeOwnerProvider] Signing request:', {
          method,
          params: paramsArray,
        })

        const eoaAccounts = (await this.eoaProvider.request({
          method: 'eth_accounts',
        })) as string[]

        if (!eoaAccounts || eoaAccounts.length === 0) {
          throw new Error('EOA wallet not connected')
        }

        const eoaAddress = eoaAccounts[0]
        console.log('[SafeOwnerProvider] EOA address:', eoaAddress)
        console.log('[SafeOwnerProvider] Safe address:', this.safe.safeAddress)

        // Replace Safe address with EOA address in params
        // For personal_sign: [message, address]
        // For eth_signTypedData_v4: [address, typedData]
        const modifiedParams = paramsArray.map((param) => {
          // If param is the Safe address, replace with EOA address
          if (
            typeof param === 'string' &&
            param.toLowerCase() === this.safe.safeAddress.toLowerCase()
          ) {
            console.log('[SafeOwnerProvider] Replaced Safe address with EOA address')
            return eoaAddress
          }
          return param
        })

        console.log('[SafeOwnerProvider] Modified params:', modifiedParams)
        return this.eoaProvider.request({ method, params: modifiedParams })
      }

      // Transaction methods - error for now (Safe Transaction Service TBD)
      case 'eth_sendTransaction':
      case 'eth_sendRawTransaction':
        throw new Error(
          'Safe transactions are not yet supported. ' +
            'This feature will use Safe Transaction Service for multi-signature approval. ' +
            'For now, only SIWE authentication is supported.'
        )

      // Read operations - use publicClient
      case 'eth_call': {
        const callParams = paramsArray[0] as CallParams
        const blockTag = (paramsArray[1] as string) || 'latest'

        const result = await this.publicClient.call({
          to: callParams.to as `0x${string}`,
          data: callParams.data as `0x${string}` | undefined,
          // Note: viem's call doesn't use 'from', it uses account context
          ...(callParams.gas && { gas: BigInt(callParams.gas) }),
          ...(callParams.gasPrice && { gasPrice: BigInt(callParams.gasPrice) }),
          ...(callParams.value && { value: BigInt(callParams.value) }),
          blockTag: blockTag as 'latest' | 'earliest' | 'pending',
        })

        return result.data
      }

      case 'eth_getBalance': {
        const address = paramsArray[0] as `0x${string}`
        const blockTag = (paramsArray[1] as string) || 'latest'

        const balance = await this.publicClient.getBalance({
          address,
          blockTag: blockTag as 'latest' | 'earliest' | 'pending',
        })

        return this.numberToHex(balance)
      }

      case 'eth_getCode': {
        const address = paramsArray[0] as `0x${string}`
        const blockTag = (paramsArray[1] as string) || 'latest'

        return this.publicClient.getBytecode({
          address,
          blockTag: blockTag as 'latest' | 'earliest' | 'pending',
        })
      }

      case 'eth_getStorageAt': {
        const address = paramsArray[0] as `0x${string}`
        const position = paramsArray[1] as `0x${string}`
        const blockTag = (paramsArray[2] as string) || 'latest'

        return this.publicClient.getStorageAt({
          address,
          slot: position,
          blockTag: blockTag as 'latest' | 'earliest' | 'pending',
        })
      }

      case 'eth_getTransactionCount': {
        const address = paramsArray[0] as `0x${string}`
        const blockTag = (paramsArray[1] as string) || 'latest'

        const count = await this.publicClient.getTransactionCount({
          address,
          blockTag: blockTag as 'latest' | 'earliest' | 'pending',
        })

        return this.numberToHex(count)
      }

      case 'eth_getBlockByNumber': {
        const blockNumber = paramsArray[0] as string
        const includeTransactions = paramsArray[1] as boolean

        return this.publicClient.getBlock({
          blockNumber: blockNumber === 'latest' ? undefined : BigInt(blockNumber),
          includeTransactions,
        })
      }

      case 'eth_getBlockByHash': {
        const blockHash = paramsArray[0] as `0x${string}`
        const includeTransactions = paramsArray[1] as boolean

        return this.publicClient.getBlock({
          blockHash,
          includeTransactions,
        })
      }

      case 'eth_getTransactionByHash': {
        const hash = paramsArray[0] as `0x${string}`
        return this.publicClient.getTransaction({ hash })
      }

      case 'eth_getTransactionReceipt': {
        const hash = paramsArray[0] as `0x${string}`
        return this.publicClient.getTransactionReceipt({ hash })
      }

      case 'eth_estimateGas': {
        const tx = paramsArray[0] as SendTransactionParams

        // Build base params
        const baseParams: {
          to: `0x${string}`
          data?: `0x${string}`
          value?: bigint
          nonce?: number
        } = {
          to: tx.to as `0x${string}`,
          ...(tx.data && { data: tx.data as `0x${string}` }),
          ...(tx.value && { value: BigInt(tx.value) }),
          ...(tx.nonce && { nonce: Number(tx.nonce) }),
        }

        // Add gas params (either legacy or EIP-1559, not both)
        let gasEstimate: bigint
        if (tx.maxFeePerGas || tx.maxPriorityFeePerGas) {
          // EIP-1559 transaction
          gasEstimate = await this.publicClient.estimateGas({
            ...baseParams,
            ...(tx.maxFeePerGas && { maxFeePerGas: BigInt(tx.maxFeePerGas) }),
            ...(tx.maxPriorityFeePerGas && {
              maxPriorityFeePerGas: BigInt(tx.maxPriorityFeePerGas),
            }),
          })
        } else {
          // Legacy transaction
          gasEstimate = await this.publicClient.estimateGas({
            ...baseParams,
            ...(tx.gasPrice && { gasPrice: BigInt(tx.gasPrice) }),
          })
        }

        return this.numberToHex(gasEstimate)
      }

      case 'eth_gasPrice': {
        const gasPrice = await this.publicClient.getGasPrice()
        return this.numberToHex(gasPrice)
      }

      case 'eth_blockNumber': {
        const blockNumber = await this.publicClient.getBlockNumber()
        return this.numberToHex(blockNumber)
      }

      // Wallet permissions (EIP-2255)
      case 'wallet_getPermissions':
      case 'wallet_requestPermissions':
        // For now, return empty permissions
        return []

      // Unsupported methods
      default:
        throw new Error(`Method ${method} is not supported by SafeOwnerProvider`)
    }
  }

  /**
   * Convert number or bigint to hex string
   */
  private numberToHex(value: number | bigint): string {
    return `0x${value.toString(16)}`
  }
}
