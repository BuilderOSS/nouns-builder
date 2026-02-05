import { useAvailableUpgrade } from '@buildeross/hooks/useAvailableUpgrade'
import { auctionAbi, tokenAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, TransactionType } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { getProvider } from '@buildeross/utils/provider'
import { Stack, Text } from '@buildeross/zord'
import { FormikHelpers } from 'formik'
import gte from 'lodash/gte'
import React from 'react'
import { Address, encodeFunctionData, isAddress } from 'viem'
import { useReadContract } from 'wagmi'

import { UpgradeInProgress, UpgradeRequired } from '../Upgrade'
import AirdropForm from './AirdropForm'
import { AirdropFormValues } from './AirdropForm.schema'

const AIRDROP_CONTRACT_VERSION = '1.2.0'

export const Airdrop: React.FC = () => {
  const addresses = useDaoStore((state) => state.addresses)
  const transactions = useProposalStore((state) => state.transactions)
  const addTransaction = useProposalStore((state) => state.addTransaction)
  const chain = useChainStore((x) => x.chain)

  const {
    currentVersions,
    shouldUpgrade,
    activeUpgradeProposalId,
    transaction,
    latest,
    date,
    totalContractUpgrades,
  } = useAvailableUpgrade({
    chainId: chain.id,
    addresses,
    contractVersion: AIRDROP_CONTRACT_VERSION,
  })

  const { data: auctionOwner } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'owner',
    chainId: chain.id,
  })

  const { data: isMinter } = useReadContract({
    // can only check minter on contracts where version >= 1.2.0
    query: {
      enabled: gte(currentVersions?.token, AIRDROP_CONTRACT_VERSION),
    },
    abi: tokenAbi,
    address: addresses.token,
    chainId: chain.id,
    functionName: 'isMinter',
    args: [addresses.treasury as AddressType],
  })

  const handleAirdropTransaction = async (
    values: AirdropFormValues,
    actions: FormikHelpers<AirdropFormValues>
  ) => {
    if (!addresses.treasury || !values.recipients?.length) return

    const recipients = values.recipients
    const totalTokens = recipients.reduce((sum, r) => sum + r.amount, 0)

    const updateMinterTransaction = {
      functionSignature: 'updateMinters',
      target: addresses.token as AddressType,
      value: '',
      calldata: encodeFunctionData({
        abi: tokenAbi,
        functionName: 'updateMinters',
        args: [[{ minter: addresses.treasury, allowed: true }]],
      }),
    }

    const chainToQuery =
      chain.id === CHAIN_ID.FOUNDRY ? CHAIN_ID.FOUNDRY : CHAIN_ID.ETHEREUM

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

    // Process each recipient
    const airdropTransactions = []
    for (const recipient of recipients) {
      const resolvedRecipientAddress = await getEnsAddress(
        recipient.address,
        getProvider(chainToQuery)
      )

      // Validate that the resolved value is actually a valid address
      if (
        !resolvedRecipientAddress ||
        !isAddress(resolvedRecipientAddress, { strict: false })
      ) {
        console.error(`Failed to resolve valid recipient address: ${recipient.address}`)
        return
      }

      airdropTransactions.push({
        functionSignature: 'mintBatchTo',
        target: addresses.token as AddressType,
        value: '',
        calldata: encodeFunctionData({
          abi: tokenAbi,
          functionName: 'mintBatchTo',
          args: [BigInt(recipient.amount), resolvedRecipientAddress as Address],
        }),
      })
    }

    const summary =
      recipients.length === 1
        ? `Airdrop ${recipients[0].amount} ${recipients[0].amount > 1 ? 'tokens' : 'token'} to ${walletSnippet(recipients[0].address)}`
        : `Bulk airdrop ${totalTokens} tokens to ${recipients.length} recipients`

    addTransaction({
      type: TransactionType.AIRDROP,
      summary,
      transactions: airdropTransactions,
    })

    actions.resetForm()
  }

  const isTreasuryContractOwner = auctionOwner === addresses.treasury
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
      {upgradeRequired && (
        <UpgradeRequired {...{ transaction, latest, date, totalContractUpgrades }} />
      )}
      {upgradeInProgress && <UpgradeInProgress proposalId={activeUpgradeProposalId} />}
      <Stack>
        <AirdropForm
          onSubmit={handleAirdropTransaction}
          disabled={upgradeRequired || upgradeInProgress}
        />
      </Stack>
    </Stack>
  )
}
