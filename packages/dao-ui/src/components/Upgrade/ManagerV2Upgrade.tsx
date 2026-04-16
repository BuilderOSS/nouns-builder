import { managerAbi } from '@buildeross/sdk/contract'
import { useProposalStore } from '@buildeross/stores'
import { AddressType, TransactionBundle, TransactionType } from '@buildeross/types'
import { UpgradeCard } from '@buildeross/ui/UpgradeCard'
import { Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { encodeFunctionData } from 'viem'

import { default as summary } from './versions/manager-v2-upgrade.md'

const MANAGER_PROXY = '0xd310a3041dfcf14def5ccbc508668974b5da7174' as AddressType
const MANAGER_IMPL = '0xDaFeB89F713e25a02E4eC21A18e3757d7a76d19E' as AddressType
const TOKEN_V1_1_0 = '0xe6322201ceD0a4D6595968411285A39ccf9d5989' as AddressType
const TOKEN_V1_2_0 = '0xAeD75D1e5c1821E2EC29D5d24b794b13C34c5d63' as AddressType
const TOKEN_NEW = '0x0E7bBc0123F5a9d6526c44D58273a8889D6F35b0' as AddressType
const AUCTION_V1_1_0 = '0x2661fe1a882AbFD28AE0c2769a90F327850397c6' as AddressType
const AUCTION_V1_2_0 = '0x785708d09b89C470aD7B5b3f8ac804cE72B6b282' as AddressType
const AUCTION_NEW = '0x3c383f54a0024e840EB479f15926164d8f00e0A4' as AddressType
const GOVERNOR_V1_1_0 = '0x9eefEF0891b1895af967fe48C5D7D96E984B96a3' as AddressType
const GOVERNOR_V1_2_0 = '0x46eA3fd17DEb7B291AeA60E67E5cB3a104FEa11D' as AddressType
const GOVERNOR_NEW = '0x6a6ec19CdB30E74Ea19a9e269d6Ca0dBAd92D4D1' as AddressType
const NEW_MANAGER_OWNER = '0x6257eDA33CB66EdA10354ebCf6Ab49e9E7558739' as AddressType

const getManagerV2UpgradeTransaction = (): TransactionBundle => {
  const transactions = [
    {
      functionSignature: 'upgradeTo(address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'upgradeTo',
        args: [MANAGER_IMPL],
      }),
    },
    {
      functionSignature: 'registerUpgrade(address,address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'registerUpgrade',
        args: [TOKEN_V1_1_0, TOKEN_NEW],
      }),
    },
    {
      functionSignature: 'registerUpgrade(address,address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'registerUpgrade',
        args: [TOKEN_V1_2_0, TOKEN_NEW],
      }),
    },
    {
      functionSignature: 'registerUpgrade(address,address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'registerUpgrade',
        args: [AUCTION_V1_1_0, AUCTION_NEW],
      }),
    },
    {
      functionSignature: 'registerUpgrade(address,address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'registerUpgrade',
        args: [AUCTION_V1_2_0, AUCTION_NEW],
      }),
    },
    {
      functionSignature: 'registerUpgrade(address,address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'registerUpgrade',
        args: [GOVERNOR_V1_1_0, GOVERNOR_NEW],
      }),
    },
    {
      functionSignature: 'registerUpgrade(address,address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'registerUpgrade',
        args: [GOVERNOR_V1_2_0, GOVERNOR_NEW],
      }),
    },
    {
      functionSignature: 'safeTransferOwnership(address)',
      target: MANAGER_PROXY,
      value: '',
      calldata: encodeFunctionData({
        abi: managerAbi,
        functionName: 'safeTransferOwnership',
        args: [NEW_MANAGER_OWNER],
      }),
    },
  ]

  return {
    type: TransactionType.UPGRADE,
    title: `Upgrade Nouns Builder Manager to v2.0.0`,
    summary: 'Manager contract upgrade to v2.0.0 with registered upgrade mappings',
    transactions,
  }
}

export const ManagerV2Upgrade = ({
  hasThreshold,
  onOpenProposalReview,
}: {
  hasThreshold: boolean
  onOpenProposalReview: () => void
}) => {
  const startProposalDraft = useProposalStore((state) => state.startProposalDraft)

  const handleUpgrade = (): void => {
    startProposalDraft({
      transactions: [getManagerV2UpgradeTransaction()],
      disabled: true,
      title: `Nouns Builder Manager Upgrade v2.0.0 ${dayjs().format('YYYY-MM-DD')}`,
      summary,
    })

    onOpenProposalReview()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={'init'}
        animate={'open'}
        variants={{
          init: {
            height: 0,
            overflow: 'hidden',
            transition: {
              ease: 'easeInOut',
            },
          },
          open: {
            height: 'auto',
            transition: {
              ease: 'easeInOut',
            },
          },
        }}
      >
        <Flex direction={'column'} mt={'x6'}>
          <Text color="text3" mb={'x4'}>
            Upgrade Available
          </Text>
          <UpgradeCard
            version="- Manager Upgrade v2.0.0"
            onUpgrade={handleUpgrade}
            hasThreshold={hasThreshold}
            description={
              'Upgrade the Builder Manager contract to v2.0.0, register token/auction/governor 1.1 and 1.2 upgrade paths, and transfer manager ownership to the Gnosis Safe.'
            }
            totalContractUpgrades={8}
          />
        </Flex>
      </motion.div>
    </AnimatePresence>
  )
}
