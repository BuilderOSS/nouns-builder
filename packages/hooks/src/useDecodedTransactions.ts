import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { Proposal } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID, DecodedTransactionData } from '@buildeross/types'
import { useMemo } from 'react'
import useSWR, { type KeyedMutator } from 'swr'

export type DecodedTransactionSuccess = {
  target: string
  value: string
  transaction: DecodedTransactionData
  isNotDecoded: false
}

export type DecodedTransactionFailure = {
  target: string
  value: string
  transaction: string
  isNotDecoded: true
}

export type DecodedTransaction = DecodedTransactionSuccess | DecodedTransactionFailure

/* format in shape defined in ethers actor */
export const formatSendEth = (value: string): DecodedTransactionData => {
  return {
    functionName: 'send',
    args: {
      ['value']: { name: `value`, value: value, type: `uint256` },
    },
    functionSig: '',
    encodedData: '0x',
    argOrder: ['value'],
  }
}

type DecodeFunc = (
  chainId: CHAIN_ID,
  target: string,
  calldata: string
) => Promise<DecodedTransactionData>

const apiDecodeTx: DecodeFunc = async (
  chainId: CHAIN_ID,
  target: string,
  calldata: string
): Promise<DecodedTransactionData> => {
  const decodeRes = await fetch(`${BASE_URL}/api/decode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      calldata: calldata,
      contract: target,
      chain: chainId,
    }),
  })

  if (!decodeRes.ok) throw new Error('Decode failed')

  const data = await decodeRes.json()

  if (data?.error) throw new Error('Decode failed')

  return data
}

const decodeTx = async (
  chainId: CHAIN_ID,
  target: string,
  calldata: string,
  value: string,
  decodeFunc: DecodeFunc = apiDecodeTx
): Promise<DecodedTransactionData> => {
  /* if calldata is '0x' */
  const isEthTransfer = calldata === '0x'

  if (isEthTransfer) {
    return formatSendEth(value)
  }

  try {
    const decoded = await decodeFunc(chainId, target, calldata)
    return decoded
  } catch (err) {
    console.error('Error decoding transaction:', err)

    throw new Error('Decode failed')
  }
}

export const decodeTransactions = async (
  chainId: CHAIN_ID,
  targets: string[],
  calldatas: string[],
  values: string[],
  decodeFunc: DecodeFunc = apiDecodeTx
): Promise<DecodedTransaction[]> => {
  return Promise.all(
    targets.map(async (target, i) => {
      try {
        const transaction = await decodeTx(
          chainId,
          target,
          calldatas[i],
          values[i],
          decodeFunc
        )
        return {
          target,
          transaction,
          value: values[i] ?? '0',
          isNotDecoded: false,
        } as DecodedTransactionSuccess
      } catch (err) {
        return {
          target,
          value: values[i] ?? '0',
          transaction: calldatas[i],
          isNotDecoded: true,
        } as DecodedTransactionFailure
      }
    })
  )
}

export const useDecodedTransactions = (
  chainId: CHAIN_ID,
  proposal: Proposal
): {
  decodedTransactions: DecodedTransaction[] | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<DecodedTransaction[]>
} => {
  const { targets, calldatas, values } = proposal

  const {
    data: decodedTransactions,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWR(
    targets && calldatas && values
      ? ([SWR_KEYS.PROPOSALS_TRANSACTIONS, chainId, targets, calldatas, values] as const)
      : null,
    async ([, _chainId, _targets, _calldatas, _values]) =>
      decodeTransactions(
        _chainId as CHAIN_ID,
        _targets as string[],
        _calldatas as string[],
        _values as string[]
      ),
    { revalidateOnFocus: false }
  )

  const fallbackData = useMemo(() => {
    const hasInputs =
      Array.isArray(targets) &&
      Array.isArray(calldatas) &&
      targets.length === calldatas.length

    if (!hasInputs) return undefined

    return targets.map((target, i) => ({
      target,
      transaction: calldatas[i],
      value: values[i] ?? '0',
      isNotDecoded: true,
    })) as DecodedTransactionFailure[]
  }, [targets, calldatas, values])

  return {
    decodedTransactions: decodedTransactions ?? fallbackData,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}

export const useDecodedTransactionSingle = (
  chainId: CHAIN_ID,
  target: string,
  calldata: string,
  value: string
): {
  decodedTransaction: DecodedTransaction | undefined
  isValidating: boolean
  isLoading: boolean
  error: Error | undefined
  mutate: KeyedMutator<DecodedTransaction>
} => {
  const {
    data: decodedTransaction,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useSWR(
    target && calldata && value
      ? ([SWR_KEYS.DECODED_TRANSACTION, chainId, target, calldata, value] as const)
      : null,
    async ([, _chainId, _target, _calldata, _value]) => {
      const decoded = await decodeTransactions(
        _chainId as CHAIN_ID,
        [_target],
        [_calldata],
        [_value]
      )
      return decoded[0]
    },
    { revalidateOnFocus: false }
  )

  const fallbackData = useMemo(() => {
    if (!target || !calldata) return undefined
    return {
      target,
      transaction: calldata,
      isNotDecoded: true,
      value: value ?? '0',
    } as DecodedTransactionFailure
  }, [target, calldata, value])

  return {
    decodedTransaction: decodedTransaction ?? fallbackData,
    isLoading,
    isValidating,
    error,
    mutate,
  }
}
