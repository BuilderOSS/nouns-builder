import SWR_KEYS from '@buildeross/constants/swrKeys'
import { metadataAbi } from '@buildeross/sdk/contract'
import { getPropertyItemsCount } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import React, { useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'

import { getLayerName } from 'src/components/Artwork/LayerBox'
import { defaultHelperTextStyle } from 'src/components/Fields/styles.css'
import { transformFileProperties } from 'src/modules/create-dao'
import { TransactionType } from 'src/modules/create-proposal/constants'
import { useAvailableUpgrade } from 'src/modules/create-proposal/hooks'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useArtworkStore } from 'src/modules/create-proposal/stores/useArtworkStore'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

import { UpgradeInProgress, UpgradeRequired } from '../Upgrade'
import { ReplaceArtworkForm } from './ReplaceArtworkForm'

const REPLACE_ARTWORK_CONTRACT_VERSION = '1.2.0'

export const ReplaceArtwork = () => {
  const { orderedLayers, ipfsUpload, isUploadingToIPFS, resetForm } = useArtworkStore()
  const addresses = useDaoStore((x) => x.addresses)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const currentTransactions = useProposalStore((state) => state.transactions)
  const chain = useChainStore((x) => x.chain)

  const { shouldUpgrade, activeUpgradeProposalId } = useAvailableUpgrade({
    chainId: chain.id,
    addresses,
    contractVersion: REPLACE_ARTWORK_CONTRACT_VERSION,
  })

  const contractOrderedLayers = [...orderedLayers].reverse() // traits in the contract are reversed

  const { data } = useSWR(
    addresses.metadata
      ? [SWR_KEYS.ARTWORK_PROPERTY_ITEMS_COUNT, chain.id, addresses.metadata]
      : null,
    () => {
      if (!addresses.metadata) return
      return getPropertyItemsCount(chain.id, addresses?.metadata)
    }
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

  const invalidPropertyIndex = useMemo(() => {
    if (!propertyItemsCount || propertyItemsCount.length < 1) return -1
    return contractOrderedLayers.findIndex((x, i) => {
      return x.properties.length < propertyItemsCount[i]
    })
  }, [propertyItemsCount, contractOrderedLayers])

  const isValid =
    isPropertyCountValid &&
    invalidPropertyIndex < 0 &&
    !isUploadingToIPFS &&
    ipfsUpload.length !== 0

  const transactions = React.useMemo(() => {
    if (!orderedLayers || !ipfsUpload) return

    return transformFileProperties(orderedLayers, ipfsUpload, 500)
  }, [orderedLayers, ipfsUpload])

  const handleReplaceArtworkTransaction = () => {
    if (!transactions || !isValid) return

    const formattedTransactions = transactions.map((transaction, i) => {
      const functionSignature = i > 1 ? 'addProperties' : 'deleteAndRecreateProperties'

      return {
        functionSignature,
        target: addresses?.metadata as AddressType,
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
  }

  const hasInvalidProperty = invalidPropertyIndex >= 0 && propertyItemsCount
  const invalidPropertyOrderedLayersIndex =
    orderedLayers.length - invalidPropertyIndex - 1

  return (
    <Stack>
      <Text className={defaultHelperTextStyle} ml="x2" style={{ marginTop: -30 }}>
        This proposal will replace all existing artwork based on the new traits you
        upload.
      </Text>

      {upgradeRequired && (
        <UpgradeRequired contractVersion={REPLACE_ARTWORK_CONTRACT_VERSION} />
      )}
      {upgradeInProgress && (
        <UpgradeInProgress contractVersion={REPLACE_ARTWORK_CONTRACT_VERSION} />
      )}

      <ReplaceArtworkForm
        disabled={!isValid || upgradeRequired || upgradeInProgress}
        isPropertyCountValid={isPropertyCountValid}
        invalidProperty={
          hasInvalidProperty
            ? {
                currentLayerName: getLayerName(
                  invalidPropertyOrderedLayersIndex,
                  orderedLayers
                ),
                nextName: contractOrderedLayers[invalidPropertyIndex].trait,
                currentVariantCount: propertyItemsCount[invalidPropertyIndex],
              }
            : undefined
        }
        propertiesCount={propertiesCount || 0}
        handleSubmit={handleReplaceArtworkTransaction}
      />
    </Stack>
  )
}
