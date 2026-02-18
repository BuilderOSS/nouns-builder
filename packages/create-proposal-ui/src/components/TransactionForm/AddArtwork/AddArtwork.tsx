import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { getPropertyItems, metadataAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionType } from '@buildeross/types'
import { getLayerName } from '@buildeross/ui/Artwork'
import { transformFileProperties } from '@buildeross/utils/transformFileProperties'
import { Stack } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'

import { useArtworkStore } from '../../../stores/useArtworkStore'
import { type FormComponent } from '../types'
import { AddArtworkForm } from './AddArtworkForm'

export const AddArtwork: FormComponent = ({ resetTransactionType }) => {
  const { orderedLayers, ipfsUpload, isUploadingToIPFS, resetForm } = useArtworkStore()
  const addresses = useDaoStore((x) => x.addresses)
  const chain = useChainStore((x) => x.chain)
  const addTransaction = useProposalStore((state) => state.addTransaction)

  const contractOrderedLayers = useMemo(
    () => [...orderedLayers].reverse(), // traits in the contract are reversed
    [orderedLayers]
  )

  const { data } = useSWR(
    addresses.metadata && chain.id
      ? ([SWR_KEYS.ARTWORK_PROPERTY_ITEMS_COUNT, chain.id, addresses.metadata] as const)
      : undefined,
    ([, _chainId, _metadata]) => getPropertyItems(_chainId, _metadata)
  )

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const { propertiesCount, propertyItemsCount, properties } = data || {}

  const isPropertyCountValid = useMemo(() => {
    if (!propertiesCount) return false
    return orderedLayers.length >= propertiesCount
  }, [propertiesCount, orderedLayers])

  const invalidProperty = useMemo(() => {
    if (!propertiesCount || !propertyItemsCount || propertyItemsCount.length < 1) return
    const invalidPropertyIndex = contractOrderedLayers.findIndex((x, i) => {
      if (i > propertiesCount - 1) return false
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
  }, [propertyItemsCount, contractOrderedLayers, orderedLayers, propertiesCount])

  const invalidPropertyOrder = useMemo(() => {
    if (!orderedLayers || !properties) return
    if (orderedLayers.length !== properties.length) return // this is handled by isPropertyCountValid
    const mismatchIndex = contractOrderedLayers.findIndex((x, i) => {
      if (i > properties.length - 1) return false
      return x.trait !== properties[i].name
    })
    if (mismatchIndex === -1) return
    const correctIndex = properties.findIndex((x) => {
      return x.name === contractOrderedLayers[mismatchIndex].trait
    })
    if (correctIndex === -1) return
    const correctIndexInOrderedLayers = orderedLayers.length - correctIndex - 1
    const mismatchIndexInOrderedLayers = orderedLayers.length - mismatchIndex - 1

    return {
      invalidLayerName: getLayerName(mismatchIndexInOrderedLayers, orderedLayers),
      layerName: getLayerName(correctIndexInOrderedLayers, orderedLayers),
      trait: contractOrderedLayers[mismatchIndex].trait,
    }
  }, [orderedLayers, contractOrderedLayers, properties])

  const isValid = useMemo(
    () =>
      isPropertyCountValid &&
      !invalidProperty &&
      !invalidPropertyOrder &&
      !isUploadingToIPFS &&
      ipfsUpload.length !== 0,
    [
      isPropertyCountValid,
      invalidProperty,
      invalidPropertyOrder,
      isUploadingToIPFS,
      ipfsUpload,
    ]
  )

  const existingProperties = useMemo(() => {
    if (!properties) return []
    return properties.map((x) => x.name)
  }, [properties])

  const transactions = useMemo(() => {
    if (!orderedLayers || !ipfsUpload) return
    return transformFileProperties(orderedLayers, ipfsUpload, 500, existingProperties)
  }, [orderedLayers, ipfsUpload, existingProperties])

  const handleAddArtworkTransaction = useCallback(() => {
    if (!transactions || !isValid) return

    const formattedTransactions = transactions.map((transaction) => {
      return {
        functionSignature: 'addProperties',
        target: addresses.metadata as AddressType,
        value: '',
        calldata: encodeFunctionData({
          abi: metadataAbi,
          functionName: 'addProperties',
          args: [transaction.names, transaction.items, transaction.data],
        }),
      }
    })

    addTransaction({
      type: TransactionType.ADD_ARTWORK,
      summary: 'Add artwork',
      transactions: formattedTransactions,
    })

    resetForm()
    resetTransactionType()
  }, [
    addresses.metadata,
    addTransaction,
    isValid,
    resetForm,
    resetTransactionType,
    transactions,
  ])

  return (
    <Stack>
      <AddArtworkForm
        disabled={!isValid}
        isPropertyCountValid={isPropertyCountValid}
        propertiesCount={propertiesCount || 0}
        properties={properties || []}
        invalidProperty={invalidProperty}
        invalidPropertyOrder={invalidPropertyOrder}
        handleSubmit={handleAddArtworkTransaction}
      />
    </Stack>
  )
}
