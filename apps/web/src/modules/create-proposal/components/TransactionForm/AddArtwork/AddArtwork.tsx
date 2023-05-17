import SWR_KEYS from '@buildeross/constants/swrKeys'
import { metadataAbi } from '@buildeross/sdk/contract'
import { getPropertyItemsCount } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { Stack } from '@buildeross/zord'
import React, { useEffect, useMemo } from 'react'
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
      return getPropertyItemsCount(chain.id, addresses?.metadata)
    }
  )

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

    const formattedTransactions = transactions.map((transaction) => {
      const functionSignature =
        'addProperties(string[], (uint256,string,bool)[], (string,string))'

      return {
        functionSignature,
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
  }

  return (
    <Stack>
      <AddArtworkForm
        disabled={!isValid}
        isPropertyCountValid={isPropertyCountValid}
        propertiesCount={propertiesCount || 0}
        handleSubmit={handleReplaceArtworkTransaction}
      />
    </Stack>
  )
}
