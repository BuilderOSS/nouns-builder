import { Flex, Grid, Text } from '@zoralabs/zord'
import React from 'react'
import { formatUnits } from 'viem'

import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { TokenBalance } from 'src/hooks/useTokenBalances'
import { useLayoutStore } from 'src/stores'
import { statisticContent } from 'src/styles/About.css'
import { erc20AssetsWrapper } from 'src/styles/Proposals.css'
import { AddressType, CHAIN_ID } from 'src/typings'
import { formatCryptoVal } from 'src/utils/numbers'

export const TokenBalanceDisplay: React.FC<{
  balances: TokenBalance[] | undefined
  chainId: CHAIN_ID
  owner: AddressType | undefined
}> = ({ balances, chainId, owner }) => {
  const { isMobile } = useLayoutStore()
  if (!balances || balances.length === 0) return null

  const totalUSD = balances
    .reduce((acc, balance) => acc + parseFloat(balance.valueInUSD), 0)
    .toFixed(2)

  return (
    <>
      <Flex width={'100%'} align={'center'} gap="x6" justify={'space-between'} pr="x4">
        <Text fontSize={28} fontWeight={'display'}>
          Tokens
        </Text>
        <Flex direction={'column'} align="start">
          <Text className={statisticContent} fontWeight={'display'}>
            ${totalUSD ? totalUSD : ' '}
          </Text>
        </Flex>
      </Flex>

      <Flex
        direction={'column'}
        gap="x8"
        px={{ '@initial': 'x4', '@768': 'x20' }}
        py={{ '@initial': 'x4', '@768': 'x8' }}
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        mt={'x4'}
        mb={'x8'}
      >
        {!isMobile && (
          <Grid className={erc20AssetsWrapper} align="center" gap="x8">
            <Text fontWeight="label">Asset</Text>
            <Text fontWeight="label">Balance</Text>
            <Text fontWeight="label">Value in USD</Text>
          </Grid>
        )}
        {balances.map((tokenBalance) => {
          const url =
            ETHERSCAN_BASE_URL[chainId] + '/token/' + tokenBalance.address + '?a=' + owner
          const value = (
            <>
              <Text>
                {formatCryptoVal(
                  formatUnits(tokenBalance.balance, tokenBalance.decimals)
                )}{' '}
                {tokenBalance.symbol}
              </Text>
              <Text>${tokenBalance.valueInUSD}</Text>
            </>
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
              gap="x8"
            >
              {isMobile ? (
                <Flex direction={'column'} gap="x2" style={{ maxWidth: '420px' }}>
                  <Text>{tokenBalance.name}</Text>
                  <Flex align={'center'} width={'100%'} justify={'space-between'}>
                    {value}
                  </Flex>
                </Flex>
              ) : (
                <>
                  <Text>{tokenBalance.name}</Text>
                  {value}
                </>
              )}
            </Grid>
          )
        })}
      </Flex>
    </>
  )
}
