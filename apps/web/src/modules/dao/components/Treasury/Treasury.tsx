import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { formatCryptoVal, numberFormatter } from '@buildeross/utils/numbers'
import { Flex, Grid, Text } from '@buildeross/zord'
import React from 'react'
import { useChainStore, useDaoStore } from 'src/stores'
import { statisticContent } from 'src/styles/About.css'
import { sectionWrapperStyle } from 'src/styles/dao.css'
import useSWR from 'swr'
import { formatEther } from 'viem'
import { useBalance } from 'wagmi'

import { NFTBalance } from './NFTBalance'
import { TokenBalance } from './TokenBalance'
import { treasuryWrapper } from './Treasury.css'

export const Treasury = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  const { data: balance } = useBalance({
    address: addresses?.treasury as `0x${string}`,
    chainId: chain.id,
  })

  const { data: ethUsd } = useSWR(SWR_KEYS.ETH_USD, async () => {
    const response = await fetch(
      'https://api.coinbase.com/v2/exchange-rates?currency=ETH'
    )
    const json = await response.json()
    return json.data.rates.USD
  })

  const { data: earnings } = useSWR(
    chain && addresses.token
      ? ([SWR_KEYS.TREASURY_SALES, chain.id, addresses.token] as const)
      : null,
    ([, _chainId, _tokenAddress]) =>
      SubgraphSDK.connect(_chainId)
        .totalAuctionSales({ tokenAddress: _tokenAddress.toLowerCase() })
        .then((x) =>
          x.dao?.totalAuctionSales ? formatEther(x.dao.totalAuctionSales) : 0
        )
  )

  const formattedEarnings = earnings && formatCryptoVal(earnings)

  const ethToUsd = React.useMemo(() => {
    if (!balance) return 0
    const wei = balance.value
    const eth = formatEther(wei)
    const usd = ((eth as any) * ethUsd).toFixed(2)
    const usdFormatted = numberFormatter(usd)
    return usdFormatted
  }, [balance, ethUsd])

  const treasuryBalance = React.useMemo(() => {
    return balance?.value ? formatCryptoVal(formatEther(balance?.value)) : null
  }, [balance])

  return (
    <Flex direction={'column'} className={sectionWrapperStyle['proposals']} mx={'auto'}>
      <Flex width={'100%'} justify={'space-between'} align={'center'}>
        <Text fontSize={28} fontWeight={'display'}>
          Treasury
        </Text>
        {addresses.treasury && (
          <ContractLink address={addresses.treasury} size={'sm'} chainId={chain.id} />
        )}
      </Flex>

      <Grid
        className={treasuryWrapper}
        display={'grid'}
        px={{ '@initial': 'x0', '@768': 'x13' }}
        py={{ '@initial': 'x0', '@768': 'x8' }}
        borderColor={'border'}
        borderStyle={'solid'}
        borderRadius={'curved'}
        borderWidth={'normal'}
        mt={'x4'}
        mb={'x8'}
      >
        <Flex
          direction={'column'}
          p={'x3'}
          mx={'x1'}
          width={'100%'}
          justify={'space-between'}
          align={{ '@initial': 'start', '@768': 'center' }}
        >
          <Text className={statisticContent} fontWeight={'display'}>
            {earnings ? formattedEarnings : 0} ETH
          </Text>
          <Text
            variant="paragraph-md"
            mt={{ '@initial': 'x0', '@768': 'x2' }}
            color={'tertiary'}
          >
            Total Auction Sales
          </Text>
        </Flex>

        <Flex
          direction={'column'}
          p={'x3'}
          mx={'x1'}
          width={'100%'}
          align={{ '@initial': 'start', '@768': 'center' }}
        >
          <Text className={statisticContent} fontWeight={'display'}>
            {treasuryBalance} ETH
          </Text>
          <Text
            variant="paragraph-md"
            color={'tertiary'}
            mt={{ '@initial': 'x0', '@768': 'x2' }}
          >
            ETH Balance
          </Text>
        </Flex>

        <Flex
          direction={'column'}
          p={'x3'}
          mx={'x1'}
          width={'100%'}
          align={{ '@initial': 'start', '@768': 'center' }}
        >
          <Text className={statisticContent} fontWeight={'display'}>
            ${ethToUsd ? ethToUsd : ' '}
          </Text>
          <Text
            variant="paragraph-md"
            color={'tertiary'}
            mt={{ '@initial': 'x0', '@768': 'x2' }}
          >
            ETH Balance in USD
          </Text>
        </Flex>
      </Grid>
      <TokenBalance />
      <NFTBalance />
    </Flex>
  )
}
