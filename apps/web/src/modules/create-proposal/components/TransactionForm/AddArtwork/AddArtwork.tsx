import SWR_KEYS from '@buildeross/constants/swrKeys'
import { metadataAbi } from '@buildeross/sdk/contract'
import { getPropertyItems } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Stack } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo } from 'react'
import { transformFileProperties } from 'src/modules/create-dao'
import { TransactionType } from 'src/modules/create-proposal/constants'
import { useProposalStore } from 'src/modules/create-proposal/stores'
import { useArtworkStore } from 'src/modules/create-proposal/stores/useArtworkStore'
import { useChainStore, useDaoStore } from 'src/stores'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'

import { AddArtworkForm } from './AddArtworkForm'

export const AddArtwork = () => {
  const { orderedLayers, ipfsUpload, isUploadingToIPFS, resetForm } = useArtworkStore()
  const addresses = useDaoStore((x) => x.addresses)
  const chain = useChainStore((x) => x.chain)
  const addTransaction = useProposalStore((state) => state.addTransaction)

  const contractOrderedLayers = useMemo(
    () => [...orderedLayers].reverse(), // traits in the contract are reversed
    [orderedLayers]
  )

  const { data } = useSWR(
    addresses.metadata && chain.id ? SWR_KEYS.ARTWORK_PROPERTY_ITEMS_COUNT : undefined,
    () => {
      if (!addresses.metadata) return
      return getPropertyItems(chain.id, addresses?.metadata)
    }
  )

  useEffect(() => {
    resetForm()
  }, [resetForm])

  const { propertiesCount, propertyItemsCount, properties } = data || {}

  const isPropertyCountValid = useMemo(() => {
    if (!propertiesCount) return false
    return orderedLayers.length >= propertiesCount
  }, [propertiesCount, orderedLayers])

  const invalidPropertyIndex = useMemo(() => {
    if (!propertiesCount || !propertyItemsCount || propertyItemsCount.length < 1)
      return -1
    return contractOrderedLayers.findIndex((x, i) => {
      if (i > propertiesCount - 1) return false
      if (i >= propertyItemsCount.length) return true
      return x.properties.length < propertyItemsCount[i]
    })
  }, [propertyItemsCount, contractOrderedLayers, propertiesCount])

  const isValid = useMemo(
    () =>
      isPropertyCountValid &&
      invalidPropertyIndex < 0 &&
      !isUploadingToIPFS &&
      ipfsUpload.length !== 0,
    [isPropertyCountValid, invalidPropertyIndex, isUploadingToIPFS, ipfsUpload]
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
        target: addresses?.metadata as AddressType,
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
  }, [addresses?.metadata, addTransaction, isValid, resetForm, transactions])

  return (
    <Stack>
      <AddArtworkForm
        disabled={!isValid}
        isPropertyCountValid={isPropertyCountValid}
        propertiesCount={propertiesCount || 0}
        properties={properties || []}
        handleSubmit={handleAddArtworkTransaction}
      />
    </Stack>
  )
}
