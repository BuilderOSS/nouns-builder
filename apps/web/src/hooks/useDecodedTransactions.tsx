import axios from 'axios'
import useSWR from 'swr'
import { formatEther } from 'viem'

import SWR_KEYS from 'src/constants/swrKeys'
import { Proposal } from 'src/data/subgraph/requests/proposalQuery'
import { useChainStore } from 'src/stores/useChainStore'
import { CHAIN_ID, DecodedTransactionData } from 'src/typings'

export type DecodedTransactionSuccess = {
  target: string
  transaction: DecodedTransactionData
  isNotDecoded: false
}

export type DecodedTransactionFailure = {
  target: string
  transaction: string
  isNotDecoded: true
}

export type DecodedTransaction = DecodedTransactionSuccess | DecodedTransactionFailure

/* format in shape defined in ethers actor */
export const formatSendEth = (value: string) => {
  const amount = formatEther(BigInt(value))
  return {
    functionName: 'Transfer',
    args: {
      ['Transfer']: { name: `value`, value: `${amount} ETH`, type: `uint256` },
    },
    functionSig: '',
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
  const decoded = await axios.post('/api/decode', {
    calldata: calldata,
    contract: target,
    chain: chainId,
  })

  if (decoded?.data?.statusCode) throw new Error('Decode failed')

  return decoded.data
}

const decodeTx = async (
  chainId: CHAIN_ID,
  target: string,
  calldata: string,
  value: string,
  decodeFunc: DecodeFunc = apiDecodeTx
): Promise<DecodedTransactionData> => {
  /* if calldata is '0x' */
  const isTransfer = calldata === '0x'

  if (isTransfer) {
    return formatSendEth(value)
  }

  try {
    const decoded = await decodeFunc(chainId, target, calldata)
    return decoded
  } catch (err) {
    console.error('Error decoding transaction:', err)

    // if this tx has value display it as a send eth tx
    if (value.length && parseInt(value)) return formatSendEth(value)

    // if no value return original calldata
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
        return { target, transaction, isNotDecoded: false } as DecodedTransactionSuccess
      } catch (err) {
        return {
          target,
          transaction: calldatas[i],
          isNotDecoded: true,
        } as DecodedTransactionFailure
      }
    })
  )
}

export const useDecodedTransactions = (
  proposal: Proposal
): DecodedTransaction[] | undefined => {
  const chain = useChainStore((x) => x.chain)

  const { targets, calldatas, values } = proposal

  const { data: decodedTransactions } = useSWR(
    targets && calldatas && values
      ? [SWR_KEYS.PROPOSALS_TRANSACTIONS, chain.id, targets, calldatas, values]
      : null,
    async ([_key, chainId, targets, calldatas, values]) =>
      decodeTransactions(chainId, targets, calldatas, values),
    { revalidateOnFocus: false }
  )

  return decodedTransactions
}

export const useDecodedTransactionSingle = (
  target: string,
  calldata: string,
  value: string
): DecodedTransaction | undefined => {
  const chain = useChainStore((x) => x.chain)

  const { data: decodedTransaction } = useSWR(
    target && calldata && value
      ? [SWR_KEYS.DECODED_TRANSACTION, chain.id, target, calldata, value]
      : null,
    async ([_key, chainId, target, calldata, value]) => {
      const decoded = await decodeTransactions(chainId, [target], [calldata], [value])
      return decoded[0]
    },
    { revalidateOnFocus: false }
  )

  return decodedTransaction
}
