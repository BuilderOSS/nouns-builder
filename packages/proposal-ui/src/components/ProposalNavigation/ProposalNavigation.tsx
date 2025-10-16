import { getFetchableUrls } from '@buildeross/ipfs-service'
import { metadataAbi, tokenAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'
import { useReadContracts } from 'wagmi'

import { responsiveFlex } from './ProposalNavigation.css'

interface ProposalNavigationProps {
  handleBack: () => void
  children?: React.ReactNode
}

export const ProposalNavigation: React.FC<ProposalNavigationProps> = ({
  handleBack,
  children,
}) => {
  const chain = useChainStore((x) => x.chain)
  const addresses = useDaoStore((state) => state.addresses)

  const token = addresses.token
  const metadata = addresses.metadata

  const { data: contractData } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: !!token && !!metadata,
    },
    contracts: [
      {
        abi: tokenAbi,
        address: token as AddressType,
        chainId: chain.id,
        functionName: 'name',
      },
      {
        abi: metadataAbi,
        address: metadata as AddressType,
        chainId: chain.id,
        functionName: 'contractImage',
      },
    ] as const,
  })

  const [name, daoImage] = unpackOptionalArray(contractData, 2)

  return (
    <Flex w={'100%'} mt={'x8'} gap="x4" className={responsiveFlex}>
      <Box
        as="button"
        onClick={handleBack}
        aria-label="Back"
        cursor="pointer"
        style={{ background: 'none', border: 'none', padding: 0 }}
      >
        <Flex direction={'row'} align={'center'} gap={'x2'}>
          <Icon id="arrowLeft" />

          {daoImage ? (
            <Box mr="x2" flexShrink={0}>
              <FallbackImage
                srcList={getFetchableUrls(daoImage)}
                style={{ borderRadius: '100%', objectFit: 'contain' }}
                alt={`${name} avatar`}
                height={32}
                width={32}
              />
            </Box>
          ) : (
            <Box mr="x2" borderRadius="phat">
              <Avatar address={token ?? undefined} size="32" />
            </Box>
          )}

          {name && (
            <Text data-testid="dao-name" fontSize={16} fontWeight={'display'}>
              {name}
            </Text>
          )}
        </Flex>
      </Box>
      {children}
    </Flex>
  )
}
