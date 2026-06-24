import { AddressType } from '@buildeross/types'
import { useEffect, useState } from 'react'

import { getRelayBridgeCalldata } from '../utils/getRelayBridgeCalldata'

export interface BridgeTransaction {
  target: AddressType
  value: string
  calldata: `0x${string}`
  functionSignature: string
  fees?: {
    gas: { amountFormatted: string }
    relayer: { amountFormatted: string }
  }
}

export const useBridgeTransaction = ({
  sourceChainId,
  targetChainId,
  targetTreasuryAddress,
  amount,
}: {
  sourceChainId?: number
  targetChainId?: number
  targetTreasuryAddress?: AddressType
  amount?: bigint
}) => {
  const [bridgeTransaction, setBridgeTransaction] = useState<
    BridgeTransaction | undefined
  >()
  const [error, setError] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(
    () => !!(sourceChainId && targetChainId && targetTreasuryAddress && amount)
  )

  useEffect(() => {
    if (!sourceChainId || !targetChainId || !targetTreasuryAddress || !amount) {
      setBridgeTransaction(undefined)
      setError(undefined)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const fetchQuote = async () => {
      setIsLoading(true)
      setError(undefined)
      setBridgeTransaction(undefined)

      try {
        const result = await getRelayBridgeCalldata({
          originChainId: sourceChainId,
          destinationChainId: targetChainId,
          amount,
          targetTreasury: targetTreasuryAddress,
        })

        if (!cancelled) {
          setBridgeTransaction({
            target: result.to,
            value: result.value.toString(),
            calldata: result.data,
            functionSignature: 'depositNative(address,bytes32)',
            fees: result.fees,
          })
          setError(undefined)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to get bridge quote')
          setBridgeTransaction(undefined)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchQuote()

    return () => {
      cancelled = true
    }
  }, [sourceChainId, targetChainId, targetTreasuryAddress, amount])

  return { bridgeTransaction, isLoading, error }
}
