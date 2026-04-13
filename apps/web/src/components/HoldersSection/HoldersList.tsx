import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnsData } from '@buildeross/hooks'
import { useChainStore } from '@buildeross/stores'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { formatCryptoVal } from '@buildeross/utils'
import { Flex, Icon, Text } from '@buildeross/zord'
import { formatEther } from 'viem'

import { holderLink } from './HoldersList.css'

interface Holder {
  holder: `0x${string}`
  balance: bigint | string
}

interface HoldersListProps {
  holders: Holder[]
  isDrop?: boolean
}

export const HoldersList = ({ holders, isDrop = false }: HoldersListProps) => {
  if (!holders || holders.length === 0) {
    return (
      <Text variant="paragraph-sm" color="text3">
        No holders yet
      </Text>
    )
  }

  return (
    <Flex direction="column" gap="x1">
      {holders.map((holder) => {
        const balance =
          typeof holder.balance === 'string' ? BigInt(holder.balance) : holder.balance

        return (
          <HolderItem
            key={holder.holder}
            address={holder.holder}
            balance={balance}
            isDrop={isDrop}
          />
        )
      })}
    </Flex>
  )
}

interface HolderItemProps {
  address: `0x${string}`
  balance: bigint
  isDrop?: boolean
}

const HolderItem = ({ address, balance, isDrop = false }: HolderItemProps) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const chain = useChainStore((c) => c.chain)
  const chainId = chain.id

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="x3"
      py="x1"
      px="x2"
      borderRadius="curved"
      className={holderLink}
    >
      <WalletIdentityWithPreview
        address={address}
        displayName={displayName}
        avatarSrc={ensAvatar}
        avatarSize="32"
        nameVariant="paragraph-sm"
        mobileTapBehavior="toggle"
      />
      <Flex align="center" gap="x2" flexShrink={0}>
        <Flex direction="column" align="flex-end" flexShrink={0}>
          <Text variant="paragraph-sm" fontWeight="display">
            {isDrop ? balance.toString() : formatBalance(balance)}
          </Text>
        </Flex>
        <a
          href={`${ETHERSCAN_BASE_URL[chainId]}/address/${address}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${address} on Etherscan`}
          onClick={(event) => event.stopPropagation()}
        >
          <Flex align="center" justify="center" color="text3">
            <Icon id="external-16" size="sm" />
          </Flex>
        </a>
      </Flex>
    </Flex>
  )
}

function formatBalance(value: bigint | string): string {
  const balance = typeof value === 'string' ? BigInt(value) : value
  const formatted = formatEther(balance)
  return formatCryptoVal(formatted)
}
