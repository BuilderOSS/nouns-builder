import React from 'react'
import { Box, Stack, Text, atoms, Paragraph } from '@zoralabs/zord'
import { FormikHelpers } from 'formik'
import { useDaoStore } from 'src/modules/dao'
import { AnimatePresence, motion } from 'framer-motion'
import { useContractRead } from 'wagmi'
import { auctionAbi, tokenAbi } from 'src/data/contract/abis'
import { AddressType } from 'src/typings'
import gte from 'lodash/gte'
import { ethers } from 'ethers'
import { getEnsAddress } from 'src/utils/ens'
import { getProvider } from 'src/utils/provider'
import { walletSnippet } from 'src/utils/helpers'
import Link from 'next/link'
import { Icon } from 'src/components/Icon'

import { useAvailableUpgrade } from '../../../../hooks'
import { useProposalStore } from '../../../../stores'
import { TransactionType } from '../../../../constants'
import { UpgradeCard } from '../../../UpgradeCard'
import { Alert } from '../../../Alert'
import AirdropForm from './AirdropForm'
import { AirdropFormValues } from './AirdropForm.schema'

const AIRDROP_CONTRACT_VERSION = '1.2.0'

const animation = {
  init: {
    height: 0,
    overflow: 'hidden',
    transition: {
      animate: 'easeInOut',
    },
  },
  open: {
    height: 'auto',
    transition: {
      animate: 'easeInOut',
    },
  },
}

export const Airdrop: React.FC = () => {
  const addresses = useDaoStore((state) => state.addresses)
  const transactions = useProposalStore((state) => state.transactions)
  const addTransaction = useProposalStore((state) => state.addTransaction)

  const {
    latest,
    date,
    transaction: upgradeTransaction,
    currentVersions,
    shouldUpgrade,
    activeUpgradeProposalId,
    totalContractUpgrades,
  } = useAvailableUpgrade(addresses, AIRDROP_CONTRACT_VERSION)

  const { data: auctionOwner } = useContractRead({
    abi: auctionAbi,
    address: addresses?.auction,
    functionName: 'owner',
  })

  const { data: isMinter } = useContractRead({
    // can only check minter on contracts where version >= 1.2.0
    enabled: gte(currentVersions?.token, AIRDROP_CONTRACT_VERSION),
    abi: tokenAbi,
    address: addresses?.token,
    functionName: 'isMinter',
    args: [addresses?.treasury as AddressType],
  })

  const handleUpgrade = (): void => {
    addTransaction(upgradeTransaction!)
  }

  const handleAirdropTransaction = async (
    values: AirdropFormValues,
    actions: FormikHelpers<AirdropFormValues>
  ) => {
    if (!values.amount || !values.recipientAddress) return

    const { amount, recipientAddress: recipient } = values

    const tokenInterface = new ethers.utils.Interface(tokenAbi)

    const updateMinterTransaction = {
      functionSignature: 'updateMinters',
      target: addresses?.token as AddressType,
      value: '',
      calldata: tokenInterface.encodeFunctionData('updateMinters((address,bool)[])', [
        [{ minter: addresses?.treasury, allowed: true }],
      ]),
    }

    const resolvedRecipientAddress = await getEnsAddress(recipient || '', getProvider())
    const airdropTransaction = {
      functionSignature: 'mintBatchTo',
      target: addresses?.token as AddressType,
      value: '',
      calldata: tokenInterface.encodeFunctionData('mintBatchTo(uint256,address)', [
        amount,
        resolvedRecipientAddress,
      ]),
    }

    const unit = amount > 1 ? 'tokens' : 'token'

    addTransaction({
      type: TransactionType.AIRDROP,
      summary: `Airdrop ${amount} ${unit} to ${walletSnippet(recipient)}`,
      transactions: [...(!isMinter ? [updateMinterTransaction] : []), airdropTransaction],
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
      {upgradeRequired && (
        <AnimatePresence>
          <motion.div initial={'init'} animate={'open'} variants={animation}>
            <Box mb={'x10'}>
              <UpgradeCard
                hasThreshold={true}
                totalContractUpgrades={totalContractUpgrades}
                version={latest}
                date={date}
                onUpgrade={handleUpgrade}
                alert={<Alert />}
              />
            </Box>
          </motion.div>
        </AnimatePresence>
      )}
      {upgradeInProgress && (
        <Box mb={'x10'} data-testid="upgrade-in-progress">
          <Paragraph size="md" color="negative">
            It looks like you currently have an{' '}
            <Link
              href={{
                pathname: '/dao/[token]/vote/[id]',
                query: { token: addresses?.token, id: activeUpgradeProposalId },
              }}
            >
              <Box
                display={'inline-flex'}
                className={atoms({ textDecoration: 'underline' })}
              >
                upgrade proposal{' '}
                <Icon align="center" fill="negative" id="external-16" size="sm" />
              </Box>
            </Link>
            in progress. The upgrade needs to be executed in order to access airdrops.
          </Paragraph>
        </Box>
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
