import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Stack, Text } from '@buildeross/zord'
import { FormikHelpers } from 'formik'
import gte from 'lodash/gte'
import React from 'react'
import { Address, encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

import { auctionAbi, tokenAbi } from 'src/data/contract/abis'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { getEnsAddress } from 'src/utils/ens'
import { walletSnippet } from 'src/utils/helpers'
import { getProvider } from 'src/utils/provider'

import { TransactionType } from '../../../constants'
import { useAvailableUpgrade } from '../../../hooks'
import { useProposalStore } from '../../../stores'
import { UpgradeInProgress, UpgradeRequired } from '../Upgrade'
import AirdropForm from './AirdropForm'
import { AirdropFormValues } from './AirdropForm.schema'

const AIRDROP_CONTRACT_VERSION = '1.2.0'

export const Airdrop: React.FC = () => {
  const addresses = useDaoStore((state) => state.addresses)
  const transactions = useProposalStore((state) => state.transactions)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)

  const { currentVersions, shouldUpgrade, activeUpgradeProposalId } = useAvailableUpgrade(
    { chainId: chain.id, addresses, contractVersion: AIRDROP_CONTRACT_VERSION }
  )

  const { data: auctionOwner } = useReadContract({
    abi: auctionAbi,
    address: addresses?.auction,
    functionName: 'owner',
    chainId: chain.id,
  })

  const { data: isMinter } = useReadContract({
    // can only check minter on contracts where version >= 1.2.0
    query: {
      enabled: gte(currentVersions?.token, AIRDROP_CONTRACT_VERSION),
    },
    abi: tokenAbi,
    address: addresses?.token,
    chainId: chain.id,
    functionName: 'isMinter',
    args: [addresses?.treasury as AddressType],
  })

  const handleAirdropTransaction = async (
    values: AirdropFormValues,
    actions: FormikHelpers<AirdropFormValues>
  ) => {
    if (!values.amount || !values.recipientAddress || !addresses.treasury) return

    const { amount, recipientAddress: recipient } = values

    const updateMinterTransaction = {
      functionSignature: 'updateMinters',
      target: addresses?.token as AddressType,
      value: '',
      calldata: encodeFunctionData({
        abi: tokenAbi,
        functionName: 'updateMinters',
        args: [[{ minter: addresses.treasury, allowed: true }]],
      }),
    }
    const chainToQuery =
      chain.id === CHAIN_ID.FOUNDRY ? CHAIN_ID.FOUNDRY : CHAIN_ID.ETHEREUM

    const resolvedRecipientAddress = await getEnsAddress(
      recipient || '',
      getProvider(chainToQuery)
    )

    const airdropTransaction = {
      functionSignature: 'mintBatchTo',
      target: addresses?.token as AddressType,
      value: '',
      calldata: encodeFunctionData({
        abi: tokenAbi,
        functionName: 'mintBatchTo',
        args: [BigInt(amount), resolvedRecipientAddress as Address],
      }),
    }

    const unit = amount > 1 ? 'tokens' : 'token'

    const doesNotContainUpdateMinter =
      transactions.findIndex(
        (transaction) => transaction.type === TransactionType.UPDATE_MINTER
      ) === -1

    if (!isMinter && doesNotContainUpdateMinter) {
      addTransaction({
        type: TransactionType.UPDATE_MINTER,
        summary: `Authorize DAO Treasury to mint new tokens`,
        transactions: [updateMinterTransaction],
      })
    }

    addTransaction({
      type: TransactionType.AIRDROP,
      summary: `Airdrop ${amount} ${unit} to ${walletSnippet(recipient)}`,
      transactions: [airdropTransaction],
    })

    actions.resetForm()
  }

  const isTreasuryContractOwner = auctionOwner === addresses?.treasury
  if (!isTreasuryContractOwner) {
    return (
      <Stack>
        <Text color="negative">
          Oops, you need to have run an auction in order to access airdrops.
        </Text>
      </Stack>
    )
  }

  const upgradeNotQueued = !transactions.some(
    (transaction) => transaction.type === TransactionType.UPGRADE
  )
  const upgradeRequired = shouldUpgrade && upgradeNotQueued
  const upgradeInProgress = !!activeUpgradeProposalId

  return (
    <Stack data-testid="airdrop">
      {upgradeRequired && <UpgradeRequired contractVersion={AIRDROP_CONTRACT_VERSION} />}
      {upgradeInProgress && (
        <UpgradeInProgress contractVersion={AIRDROP_CONTRACT_VERSION} />
      )}
      <Stack>
        <AirdropForm
          onSubmit={handleAirdropTransaction}
          disabled={upgradeRequired || upgradeInProgress}
        />
      </Stack>
    </Stack>
  )
}
