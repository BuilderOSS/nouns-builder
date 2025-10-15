import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useTokenBalances } from '@buildeross/hooks/useTokenBalances'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Avatar, NameAvatar } from '@buildeross/ui/Avatar'
import { skeletonAnimation } from '@buildeross/ui/styles'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import React from 'react'
import { formatUnits } from 'viem'

import { statisticContent } from '../../styles/About.css'
import { erc20AssetsWrapper } from './Treasury.css'

export const TokenBalance: React.FC = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const owner = addresses.treasury
  const { balances, isLoading } = useTokenBalances(chain.id, addresses.treasury)

  const totalUSD = balances
    ?.reduce((acc, balance) => acc + parseFloat(balance.valueInUSD), 0)
    .toFixed(2)

  const sortedBalances = balances?.sort(
    (a, b) => parseFloat(b.valueInUSD) - parseFloat(a.valueInUSD)
  )

  const numBalances = balances?.length ?? 0

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
                <Text>{tokenBalance.name}</Text>
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
