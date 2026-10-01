'use client'

import { Avatar } from '@buildeross/ui/Avatar'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import NextImage from 'next/image'

interface SafeModeInfoProps {
  safeAddress: string
  ownerAddress?: string
}

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

export function SafeModeInfo({ safeAddress, ownerAddress }: SafeModeInfoProps) {
  return (
    <Box
      p="x3"
      borderRadius="phat"
      borderWidth="thin"
      borderStyle="solid"
      borderColor="border"
      backgroundColor="background2"
    >
      <Stack gap="x3">
        <Flex align="center" gap="x2">
          <NextImage
            src="/icons/wallets/safe.svg"
            alt="Safe"
            width={24}
            height={24}
            style={{ borderRadius: '4px', flexShrink: 0 }}
          />
          <Stack gap="x1" style={{ minWidth: 0 }}>
            <Text variant="label-sm" color="text3">
              Safe Multisig
            </Text>
            <Flex align="center" gap="x2" style={{ minWidth: 0 }}>
              <Text
                variant="paragraph-md"
                fontWeight="display"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {formatAddress(safeAddress)}
              </Text>
              <CopyButton text={safeAddress} variant="icon" />
            </Flex>
          </Stack>
        </Flex>

        {ownerAddress && (
          <Flex align="center" justify="space-between" gap="x2">
            <Flex align="center" gap="x2" style={{ minWidth: 0 }}>
              <Text variant="label-sm" color="text3" style={{ flexShrink: 0 }}>
                Owner:
              </Text>
              <Avatar address={ownerAddress} size="20" />
              <Text
                variant="paragraph-sm"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {formatAddress(ownerAddress)}
              </Text>
            </Flex>
            <CopyButton text={ownerAddress} variant="icon" />
          </Flex>
        )}
      </Stack>
    </Box>
  )
}
