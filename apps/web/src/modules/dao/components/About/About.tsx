import SWR_KEYS from '@buildeross/constants/swrKeys'
import { useDaoMembership } from '@buildeross/hooks/useDaoMembership'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { metadataAbi, tokenAbi } from '@buildeross/sdk/contract'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { parseContractURI } from '@buildeross/utils/parseContractURI'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import Image from 'next/legacy/image'
import { useRouter } from 'next/router'
import React from 'react'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { about, daoInfo, daoName, statisticContent } from 'src/styles/About.css'
import useSWR from 'swr'
import { Address, formatEther } from 'viem'
import { useAccount, useBalance, useReadContracts } from 'wagmi'

import { MembersList } from '../MembersList'
import { DaoDescription } from './DaoDescription'
import { ExternalLinks } from './ExternalLinks'
import { Founder } from './Founder'
import { Membership } from './Membership'
import { Statistic } from './Statistic'

export const About: React.FC = () => {
  const {
    addresses: { token, treasury, metadata },
  } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { isMobile } = useLayoutStore()
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
  const metadataContractParams = {
    abi: metadataAbi,
    address: metadata as Address,
    chainId: chain.id,
  }

  const { data: contractData } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...tokenContractParams, functionName: 'name' },
      { ...tokenContractParams, functionName: 'totalSupply' },
      { ...tokenContractParams, functionName: 'getFounders' },
      { ...metadataContractParams, functionName: 'contractImage' },
      { ...metadataContractParams, functionName: 'description' },
      { ...metadataContractParams, functionName: 'contractURI' },
    ] as const,
  })

  const [name, totalSupply, founders, daoImage, description, contractURI] =
    unpackOptionalArray(contractData, 6)
  const parsedContractURI = parseContractURI(contractURI)

  const { data: balance } = useBalance({
    address: treasury as Address,
    chainId: chain.id,
  })

  const { data } = useSWR(
    chain && token ? [SWR_KEYS.DAO_INFO, chain.id, token] : null,
    async ([_key, chainId, token]) => {
      const res = await SubgraphSDK.connect(chainId)
        .daoInfo({
          tokenAddress: token.toLowerCase(),
        })
        .then((x) => x.dao)

      return {
        ownerCount: res?.ownerCount,
      }
    }
  )

  const treasuryBalance = React.useMemo(() => {
    return balance ? formatCryptoVal(formatEther(balance.value)) : null
  }, [balance])

  const router = useRouter()

  const openTreasuryTab = () => {
    const current = { ...router.query } // Get existing query params
    current['tab'] = 'treasury'

    router.push(
      {
        pathname: router.pathname,
        query: current,
      },
      undefined,
      { shallow: true } // Prevent full page reload
    )
  }

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
                srcList={getFetchableUrls(daoImage)}
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
          <ExternalLinks links={{ website: parsedContractURI?.external_url }} />
        </Box>
      </Flex>

      <Flex
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        gap={{ '@initial': 'x2', '@768': 'x4' }}
        overflowX="scroll"
        wrap={'wrap'}
        className={daoInfo}
      >
        <Statistic
          title="Treasury"
          content={`${treasuryBalance} ETH`}
          onClick={openTreasuryTab}
        />
        <Statistic title="Owners" content={data?.ownerCount} />
        <Statistic title="Total supply" content={Number(totalSupply)} />
        <Statistic
          title="Chain"
          content={
            <Flex align={'center'} mt={{ '@initial': 'x1', '@768': 'x3' }} pr="x2">
              <Box mr="x2">
                <Image src={chain.icon} alt={chain.name} height={28} width={28} />
              </Box>
              <Text fontWeight={'display'} className={statisticContent}>
                {chain.name}
              </Text>
            </Flex>
          }
        />
      </Flex>

      <DaoDescription description={description} />

      <Box
        mt={{ '@initial': 'x4', '@768': 'x6' }}
        display={{ '@initial': 'block', '@768': 'none' }}
      >
        <ExternalLinks links={{ website: parsedContractURI?.external_url }} />
      </Box>
      {!!membershipInfo && (
        <Membership {...membershipInfo} totalSupply={Number(totalSupply)} />
      )}
      <Text
        variant="heading-xs"
        mt={{ '@initial': 'x4', '@768': 'x10' }}
        style={{ fontWeight: 800 }}
      >
        Founders
      </Text>

      {founders && founders?.length > 0 ? (
        <Grid columns={isMobile ? 1 : 2} mt="x6" gap="x4">
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
      <MembersList totalSupply={Number(totalSupply)} ownerCount={data?.ownerCount} />
    </Box>
  )
}
