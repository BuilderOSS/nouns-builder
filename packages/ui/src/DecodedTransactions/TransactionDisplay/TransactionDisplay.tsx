import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { useTransactionSummary } from '@buildeross/hooks/useTransactionSummary'
import {
  CHAIN_ID,
  DaoContractAddresses,
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundleContext,
  SimulationOutput,
} from '@buildeross/types'
import { Stack } from '@buildeross/zord'
import React from 'react'

import { ArgumentDisplay } from '../ArgumentDisplay'
import { TransactionAiSummary } from './TransactionAiSummary'
import {
  DecodedCallDisplay,
  DisplayModeToggle,
  RawCalldataDisplay,
  SimulationWarning,
  TransactionDisplayShell,
} from './TransactionDisplayShared'
import { useDecodedTransactionContext } from './useDecodedTransactionContext'

const DISABLE_AI_SUMMARY = process.env.NEXT_PUBLIC_DISABLE_AI_SUMMARY === 'true'

export const TransactionDisplay: React.FC<
  DecodedTransaction & {
    chainId: CHAIN_ID
    addresses: DaoContractAddresses
    index: number
    proposalMetadata?: ProposalDescriptionMetadataV1
    bundleContext?: ProposalTransactionBundleContext
    simulation?: SimulationOutput
    isDecoding?: boolean
  }
> = ({
  chainId,
  addresses,
  index,
  proposalMetadata,
  bundleContext,
  simulation,
  isDecoding = false,
  ...decoded
}) => {
  const [showRawCalldata, setShowRawCalldata] = React.useState(false)

  const isDecoded = !decoded.isNotDecoded && !!decoded.transaction.args

  const {
    sortedArgs,
    escrowData,
    streamData,
    tokenMetadata,
    nftMetadata,
    isLoadingMetadata,
    isSendWithValue,
  } = useDecodedTransactionContext({
    chainId,
    transaction: isDecoded
      ? decoded.transaction
      : {
          functionName: 'send',
          args: { value: { name: 'value', value: decoded.value, type: 'uint256' } },
          functionSig: '',
          encodedData: '0x',
          argOrder: ['value'],
        },
    target: decoded.target,
    value: decoded.value,
    enabled: isDecoded,
  })

  const transactionData = React.useMemo(() => {
    if (!isDecoded || isLoadingMetadata || DISABLE_AI_SUMMARY) return null

    return {
      chainId,
      addresses,
      transaction: {
        args: decoded.transaction.args,
        functionName: decoded.transaction.functionName,
      },
      target: decoded.target as `0x${string}`,
      tokenMetadata: tokenMetadata || undefined,
      nftMetadata: nftMetadata || undefined,
      escrowData: escrowData || undefined,
      streamData: streamData || undefined,
      proposalMetadata,
      bundleContext,
    }
  }, [
    addresses,
    bundleContext,
    chainId,
    decoded,
    escrowData,
    isDecoded,
    isLoadingMetadata,
    nftMetadata,
    proposalMetadata,
    streamData,
    tokenMetadata,
  ])

  const {
    summary: aiSummary,
    error: errorSummary,
    isLoading: isGeneratingSummary,
    mutate: regenerateSummary,
  } = useTransactionSummary(transactionData)

  const rawCalldata = decoded.isNotDecoded
    ? decoded.transaction
    : decoded.transaction.encodedData || 'Unavailable'

  const toggleMode: 'toggle' | 'decoding' | 'rawOnly' = isDecoded
    ? 'toggle'
    : isDecoding
      ? 'decoding'
      : 'rawOnly'

  return (
    <Stack style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }} w="100%">
      <DisplayModeToggle
        mode={toggleMode}
        showRawCalldata={showRawCalldata}
        onToggle={() => setShowRawCalldata((state) => !state)}
      />
      <TransactionDisplayShell chainId={chainId} target={decoded.target} index={index}>
        {isDecoded && !showRawCalldata ? (
          <DecodedCallDisplay
            functionName={decoded.transaction.functionName}
            value={decoded.value}
            sortedArgs={sortedArgs}
            isSendWithValue={isSendWithValue}
            renderArg={(argKey, i) => {
              const arg = decoded.transaction.args[argKey]

              return (
                <ArgumentDisplay
                  chainId={chainId}
                  key={`${argKey}-${arg.name}-${i}`}
                  arg={arg}
                  target={decoded.target}
                  functionName={decoded.transaction.functionName}
                  tokenMetadata={tokenMetadata}
                  nftMetadata={nftMetadata}
                  escrowData={escrowData}
                  streamData={streamData}
                />
              )
            }}
          />
        ) : (
          <RawCalldataDisplay calldata={rawCalldata} value={decoded.value} />
        )}
      </TransactionDisplayShell>

      <SimulationWarning simulation={simulation} />

      <TransactionAiSummary
        isVisible={
          isDecoded &&
          !isLoadingMetadata &&
          !DISABLE_AI_SUMMARY &&
          !errorSummary &&
          !isGeneratingSummary
        }
        isGeneratingSummary={isGeneratingSummary}
        aiSummary={aiSummary}
        errorSummary={errorSummary}
        onRegenerate={() => regenerateSummary()}
      />
    </Stack>
  )
}
