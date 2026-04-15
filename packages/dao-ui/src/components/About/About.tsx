import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useDaoMembership } from '@buildeross/hooks/useDaoMembership'
import { tokenAbi } from '@buildeross/sdk/contract'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { parseDaoMetadataString } from '@buildeross/utils/daoMetadata'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'
import { Address, formatEther } from 'viem'
import { useAccount, useBalance, useReadContracts } from 'wagmi'

import { about, daoInfo, daoName, statisticContent } from '../../styles/About.css'
import { MembersList } from '../MembersList'
import { responsiveGrid } from './About.css'
import { DaoDescription } from './DaoDescription'
import { ExternalLinks } from './ExternalLinks'
import { Founder } from './Founder'
import { Membership } from './Membership'
import { Statistic } from './Statistic'

export type AboutProps = {
  onOpenTreasury?: () => void
}

export const About: React.FC<AboutProps> = ({ onOpenTreasury }) => {
  const {
    addresses: { token, treasury },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { address } = useAccount()

  const { data: membershipInfo } = useDaoMembership({
    chainId: chain.id,
    collectionAddress: token,
    signerAddress: address,
  })

  const tokenContractParams = {
    abi: tokenAbi,
    address: token as Address,
    chainId: chain.id,
  }
  const { data: foundersData } = useReadContracts({
    allowFailure: false,
    contracts: [{ ...tokenContractParams, functionName: 'getFounders' }] as const,
  })

  const [founders] = unpackOptionalArray(foundersData, 1)

  const { data: balance } = useBalance({
    address: treasury as Address,
    chainId: chain.id,
  })

  const { data } = useSWR(
    chain && token ? ([SWR_KEYS.DAO_INFO, chain.id, token] as const) : null,
    async ([, _chainId, _token]) => {
      const res = await SubgraphSDK.connect(_chainId)
        .daoInfo({
          tokenAddress: _token.toLowerCase(),
        })
        .then((x) => x.dao)

      return res
    }
  )

  const parsedDaoMetadata = parseDaoMetadataString(data?.metadata || data?.description)
  const externalLinks = {
    ...Object.fromEntries((data?.links || []).map((link) => [link.key, link.url])),
    ...parsedDaoMetadata.links,
    ...(data?.projectURI ? { website: data.projectURI } : {}),
  }

  const name = data?.name
  const daoImage = data?.contractImage
  const ownerCount = data?.ownerCount || '0'
  const totalSupplyDisplay =
    data?.totalSupply && Number(data.totalSupply) > 0
      ? Number(data.totalSupply).toString()
      : '0'

  const treasuryBalance = React.useMemo(() => {
    return balance ? `${formatCryptoVal(formatEther(balance.value))} ETH` : ''
  }, [balance])

  return (
    <Box className={about}>
      <Flex
        direction={{ '@initial': 'column', '@768': 'row' }}
        align="center"
        justify={{ '@initial': 'flex-start', '@768': 'space-between' }}
      >
        <Flex align="center" justify="flex-start" w="100%">
          {daoImage ? (
            <Box mr="x4">
              <FallbackImage
                src={daoImage}
                style={{
                  borderRadius: '100%',
                  objectFit: 'contain',
                }}
                alt=""
                height={52}
                width={52}
              />
            </Box>
          ) : (
            <Box mr="x4" borderRadius="phat">
              <Avatar address={token ?? undefined} size="52" />
            </Box>
          )}
          <Text className={daoName}>{name}</Text>
        </Flex>

        <Box display={{ '@initial': 'none', '@768': 'block' }}>
          <ExternalLinks links={externalLinks} />
        </Box>
      </Flex>

      <Flex
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        gap={{ '@initial': 'x2', '@768': 'x4' }}
        overflowX="scroll"
        wrap={'wrap'}
        className={daoInfo}
      >
        <Statistic title="Treasury" content={treasuryBalance} onClick={onOpenTreasury} />
        <Statistic title="Owners" content={ownerCount} />
        <Statistic title="Total supply" content={totalSupplyDisplay} />
        <Statistic
          title="Chain"
          content={
            <Flex align={'center'} mt={{ '@initial': 'x1', '@768': 'x3' }} pr="x2">
              <Box mr="x2">
                <img
                  src={chain.icon}
                  alt={chain.name}
                  height={28}
                  width={28}
                  style={{ height: '28px', width: '28px' }}
                />
              </Box>
              <Text fontWeight={'display'} className={statisticContent}>
                {chain.name}
              </Text>
            </Flex>
          }
        />
      </Flex>

      <DaoDescription
        description={parsedDaoMetadata.description || data?.description || ''}
      />

      <Box
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        display={{ '@initial': 'block', '@768': 'none' }}
      >
        <ExternalLinks links={externalLinks} />
      </Box>
      {!!membershipInfo && (
        <Membership {...membershipInfo} totalSupply={Number(data?.totalSupply || 0)} />
      )}
      <Text
        variant="heading-xs"
        mt={{ '@initial': 'x4', '@768': 'x10' }}
        style={{ fontWeight: 800 }}
      >
        Founders
      </Text>

      {founders && founders?.length > 0 ? (
        <Grid mt="x6" gap="x4" className={responsiveGrid}>
          {founders
            .filter((founder) => founder.ownershipPct > 0)
            .map((founder) => (
              <Founder key={founder.wallet} {...founder} />
            ))}
        </Grid>
      ) : (
        <Text mt="x2" color="text3">
          No founders allocation set.
        </Text>
      )}
      {!!data?.totalSupply && Number(data.totalSupply) > 0 && (
        <MembersList totalSupply={Number(data.totalSupply)} />
      )}
    </Box>
  )
}
