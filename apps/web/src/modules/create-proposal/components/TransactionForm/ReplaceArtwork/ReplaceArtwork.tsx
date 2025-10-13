import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useAvailableUpgrade } from '@buildeross/hooks/useAvailableUpgrade'
import { getPropertyItems, metadataAbi } from '@buildeross/sdk/contract'
import { AddressType, TransactionType } from '@buildeross/types'
import { getLayerName } from '@buildeross/ui/Artwork'
import { defaultHelperTextStyle } from '@buildeross/ui/styles'
import { transformFileProperties } from '@buildeross/utils/transformFileProperties'
import { Stack, Text } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useChainStore, useDaoStore, useProposalStore } from 'src/stores'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'

import { useArtworkStore } from '../../../stores/useArtworkStore'
import { UpgradeInProgress, UpgradeRequired } from '../Upgrade'
import { ReplaceArtworkForm } from './ReplaceArtworkForm'

const REPLACE_ARTWORK_CONTRACT_VERSION = '1.2.0'

export const ReplaceArtwork = () => {
  const { orderedLayers, ipfsUpload, isUploadingToIPFS, resetForm } = useArtworkStore()
  const addresses = useDaoStore((x) => x.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const currentTransactions = useProposalStore((state) => state.transactions)
  const chain = useChainStore((x) => x.chain)

  const {
    shouldUpgrade,
    activeUpgradeProposalId,
    transaction,
    latest,
    date,
    totalContractUpgrades,
  } = useAvailableUpgrade({
    chainId: chain.id,
    addresses,
    contractVersion: REPLACE_ARTWORK_CONTRACT_VERSION,
  })

  const contractOrderedLayers = useMemo(
    () => [...orderedLayers].reverse(), // traits in the contract are reversed
    [orderedLayers]
  )

  const { data } = useSWR(
    addresses.metadata && chain.id
      ? ([SWR_KEYS.ARTWORK_PROPERTY_ITEMS_COUNT, chain.id, addresses.metadata] as const)
      : null,
    ([, _chainId, _metadata]) => getPropertyItems(_chainId, _metadata)
  )

  const upgradeNotQueued = !currentTransactions.some(
    (transaction) => transaction.type === TransactionType.UPGRADE
  )
  const upgradeRequired = shouldUpgrade && upgradeNotQueued
  const upgradeInProgress = !!activeUpgradeProposalId

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const { propertiesCount, propertyItemsCount } = data || {}

  const isPropertyCountValid = useMemo(() => {
    if (!propertiesCount) return false
    return orderedLayers.length >= propertiesCount
  }, [propertiesCount, orderedLayers])

  const invalidProperty = useMemo(() => {
    if (!propertyItemsCount || propertyItemsCount.length < 1) return
    const invalidPropertyIndex = contractOrderedLayers.findIndex((x, i) => {
      if (i >= propertyItemsCount.length) return true
      return x.properties.length < propertyItemsCount[i]
    })
    if (invalidPropertyIndex === -1) return
    const invalidPropertyOrderedLayersIndex =
      orderedLayers.length - invalidPropertyIndex - 1
    const currentVariantCount =
      invalidPropertyIndex < propertyItemsCount.length
        ? propertyItemsCount[invalidPropertyIndex]
        : 0
    return {
      currentLayerName: getLayerName(invalidPropertyOrderedLayersIndex, orderedLayers),
      nextName: contractOrderedLayers[invalidPropertyIndex].trait,
      currentVariantCount: currentVariantCount,
    }
  }, [orderedLayers, propertyItemsCount, contractOrderedLayers])

  const isValid = useMemo(
    () =>
      isPropertyCountValid &&
      !invalidProperty &&
      !isUploadingToIPFS &&
      ipfsUpload.length !== 0,
    [isPropertyCountValid, invalidProperty, isUploadingToIPFS, ipfsUpload]
  )

  const transactions = useMemo(() => {
    if (!orderedLayers || !ipfsUpload) return

    return transformFileProperties(orderedLayers, ipfsUpload, 500)
  }, [orderedLayers, ipfsUpload])

  const handleReplaceArtworkTransaction = useCallback(() => {
    if (!transactions || !isValid) return

    const formattedTransactions = transactions.map((transaction, i) => {
      const functionSignature = i > 1 ? 'addProperties' : 'deleteAndRecreateProperties'

      return {
        functionSignature,
        target: addresses.metadata as AddressType,
        value: '',
        calldata: encodeFunctionData({
          abi: metadataAbi,
          functionName: functionSignature,
          args: [transaction.names, transaction.items, transaction.data],
        }),
      }
    })

    addTransaction({
      type: TransactionType.REPLACE_ARTWORK,
      summary: 'Replace artwork',
      transactions: formattedTransactions,
    })

    resetForm()
  }, [addTransaction, resetForm, transactions, isValid, addresses.metadata])

  return (
    <Stack>
      <Text className={defaultHelperTextStyle} ml="x2" style={{ marginTop: -30 }}>
        This proposal will replace all existing artwork based on the new traits you
        upload.
      </Text>

      {upgradeRequired && (
        <UpgradeRequired {...{ transaction, latest, date, totalContractUpgrades }} />
      )}
      {upgradeInProgress && <UpgradeInProgress proposalId={activeUpgradeProposalId} />}

      <ReplaceArtworkForm
        disabled={!isValid || upgradeRequired || upgradeInProgress}
        isPropertyCountValid={isPropertyCountValid}
        invalidProperty={invalidProperty}
        propertiesCount={propertiesCount || 0}
        handleSubmit={handleReplaceArtworkTransaction}
      />
    </Stack>
  )
}
