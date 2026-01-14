import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnrichedPinnedAssets } from '@buildeross/hooks/useEnrichedPinnedAssets'
import { usePinnedAssets } from '@buildeross/hooks/usePinnedAssets'
import { useTokenBalances } from '@buildeross/hooks/useTokenBalances'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Avatar, NameAvatar } from '@buildeross/ui/Avatar'
import { skeletonAnimation } from '@buildeross/ui/styles'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Grid, Icon, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'
import { formatUnits } from 'viem'

import { statisticContent } from '../../styles/About.css'
import { erc20AssetsWrapper } from './Treasury.css'

export const TokenBalance: React.FC = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const owner = addresses.treasury
  const { balances, isLoading: balancesLoading } = useTokenBalances(
    chain.id,
    addresses.treasury
  )

  // Fetch pinned assets
  const { pinnedAssets, isLoading: pinnedLoading } = usePinnedAssets(
    chain.id,
    addresses.token
  )

  // Filter ERC20 pinned assets
  const pinnedERC20 = useMemo(
    () => pinnedAssets?.filter((p) => p.tokenType === 0 && !p.revoked) || [],
    [pinnedAssets]
  )

  // Fetch enriched pinned assets
  const { enrichedPinnedAssets, isLoading: enrichedLoading } = useEnrichedPinnedAssets(
    chain.id,
    addresses.treasury,
    pinnedERC20.map((p) => ({
      tokenType: p.tokenType as 0 | 1 | 2,
      token: p.token as `0x${string}`,
      isCollection: p.isCollection,
      tokenId: p.tokenId,
    }))
  )

  // Combine and dedupe balances with pinned assets
  const allTokens = useMemo(() => {
    if (!balances && !enrichedPinnedAssets) return []

    const tokenMap = new Map()

    // Add standard balances
    balances?.forEach((token) => {
      tokenMap.set(token.address.toLowerCase(), {
        ...token,
        isPinned: false,
      })
    })

    // Add/override with pinned assets (ensures low-value pinned assets appear)
    enrichedPinnedAssets?.forEach((asset) => {
      const key = asset.token.toLowerCase()
      const existing = tokenMap.get(key)

      tokenMap.set(key, {
        address: asset.token,
        balance: asset.balance || existing?.balance || '0',
        name: asset.name || existing?.name || '',
        symbol: asset.symbol || existing?.symbol || '',
        decimals: asset.decimals || existing?.decimals || 18,
        logo: asset.logo || existing?.logo || '',
        price: asset.price || existing?.price || '0',
        valueInUSD: asset.valueInUSD || existing?.valueInUSD || '0',
        isPinned: true,
      })
    })

    return Array.from(tokenMap.values())
  }, [balances, enrichedPinnedAssets])

  // Sort: pinned first, then by USD value
  const sortedBalances = useMemo(
    () =>
      allTokens.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return parseFloat(b.valueInUSD) - parseFloat(a.valueInUSD)
      }),
    [allTokens]
  )

  const totalUSD = sortedBalances
    ?.reduce((acc, balance) => acc + parseFloat(balance.valueInUSD), 0)
    .toFixed(2)

  const numBalances = sortedBalances?.length ?? 0
  const isLoading = balancesLoading || pinnedLoading || enrichedLoading

  return (
    <>
      <Flex width={'100%'} align={'center'} gap="x6" justify={'space-between'} pr="x4">
        <Text fontSize={28} fontWeight={'display'}>
          Tokens
        </Text>
        {numBalances > 0 && (
          <Flex direction={'column'} align="start">
            <Text className={statisticContent} fontWeight={'display'}>
              ${totalUSD ? totalUSD : ' '}
            </Text>
          </Flex>
        )}
      </Flex>

      {isLoading && numBalances === 0 && (
        <Flex
          direction={'column'}
          gap="x4"
          px={{ '@initial': 'x4', '@768': 'x28' }}
          py={{ '@initial': 'x4', '@768': 'x8' }}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          mt={'x6'}
          mb={'x8'}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Box
              key={index}
              width="100%"
              height="x12"
              borderRadius="curved"
              backgroundColor="background2"
              style={{ animation: skeletonAnimation }}
            />
          ))}
        </Flex>
      )}

      {!isLoading && numBalances === 0 && (
        <Flex
          direction={'column'}
          gap="x8"
          px={{ '@initial': 'x4', '@768': 'x20' }}
          py={{ '@initial': 'x4', '@768': 'x8' }}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          mt={'x6'}
          mb={'x8'}
          align="center"
          justify="center"
        >
          <Text variant="paragraph-md" color={'tertiary'}>
            No Tokens Found
          </Text>
        </Flex>
      )}

      {numBalances > 0 && (
        <Flex
          direction={'column'}
          gap="x8"
          px={{ '@initial': 'x4', '@768': 'x28' }}
          py={{ '@initial': 'x4', '@768': 'x8' }}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          mt={'x6'}
          mb={'x8'}
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          <Grid
            className={erc20AssetsWrapper}
            align="center"
            gap="x20"
            display={{ '@initial': 'none', '@768': 'grid' }}
          >
            <Text fontWeight="label" textAlign="left">
              Asset
            </Text>
            <Text fontWeight="label" textAlign="center">
              Balance
            </Text>
            <Text fontWeight="label" textAlign="right">
              Value in USD
            </Text>
          </Grid>
          {sortedBalances?.map((tokenBalance) => {
            const url =
              ETHERSCAN_BASE_URL[chain.id] +
              '/token/' +
              tokenBalance.address +
              '?a=' +
              owner

            const value = (
              <>
                <Text textAlign="center">
                  {formatCryptoVal(
                    formatUnits(BigInt(tokenBalance.balance), tokenBalance.decimals)
                  )}{' '}
                  {tokenBalance.symbol}
                </Text>
                <Text textAlign="right">${tokenBalance.valueInUSD}</Text>
              </>
            )

            const name = (
              <Flex align={'center'} gap="x2">
                {tokenBalance.logo ? (
                  <Avatar address={tokenBalance.address} src={tokenBalance.logo} />
                ) : (
                  <NameAvatar name={tokenBalance.name} />
                )}
                <Flex align={'center'} gap="x1">
                  <Text>{tokenBalance.name}</Text>
                  {tokenBalance.isPinned && <Icon id="pin" size="sm" color="text3" />}
                </Flex>
              </Flex>
            )
            return (
              <a
                key={tokenBalance.name + tokenBalance.address}
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <Flex
                  direction={'column'}
                  gap="x2"
                  style={{ maxWidth: '420px' }}
                  display={{ '@initial': 'grid', '@768': 'none' }}
                  align="center"
                >
                  {name}
                  <Flex align={'center'} width={'100%'} justify={'space-between'}>
                    {value}
                  </Flex>
                </Flex>
                <Grid
                  className={erc20AssetsWrapper}
                  align="center"
                  gap="x20"
                  display={{ '@initial': 'none', '@768': 'grid' }}
                >
                  {name}
                  {value}
                </Grid>
              </a>
            )
          })}
        </Flex>
      )}
    </>
  )
}
