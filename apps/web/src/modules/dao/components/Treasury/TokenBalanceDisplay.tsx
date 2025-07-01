import { Flex, Grid, Text } from '@zoralabs/zord'
import React from 'react'
import { formatUnits } from 'viem'

import { Avatar, NameAvatar } from 'src/components/Avatar'
import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { useTokenBalances } from 'src/hooks/useTokenBalances'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { statisticContent } from 'src/styles/About.css'
import { erc20AssetsWrapper } from 'src/styles/Proposals.css'
import { formatCryptoVal } from 'src/utils/numbers'

import { useDaoStore } from '../../stores'

export const TokenBalanceDisplay: React.FC = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const owner = addresses.treasury
  const { balances, isLoading } = useTokenBalances(chain.id, addresses.treasury)
  const { isMobile } = useLayoutStore()

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

      {numBalances === 0 && (
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
            {' '}
            {isLoading ? 'Loading...' : 'No Tokens Found'}{' '}
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
        >
          {!isMobile && (
            <Grid className={erc20AssetsWrapper} align="center" gap="x20">
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
          )}
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
              <Grid
                as="a"
                href={url}
                target="_blank"
                rel="noreferrer"
                key={tokenBalance.name + tokenBalance.address}
                className={erc20AssetsWrapper}
                align="center"
                gap="x20"
              >
                {isMobile ? (
                  <Flex direction={'column'} gap="x2" style={{ maxWidth: '420px' }}>
                    {name}
                    <Flex align={'center'} width={'100%'} justify={'space-between'}>
                      {value}
                    </Flex>
                  </Flex>
                ) : (
                  <>
                    {name}
                    {value}
                  </>
                )}
              </Grid>
            )
          })}
        </Flex>
      )}
    </>
  )
}
