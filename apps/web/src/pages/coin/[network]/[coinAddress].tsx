import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import {
  COIN_SUPPORTED_CHAIN_IDS,
  PUBLIC_ALL_CHAINS,
  PUBLIC_DEFAULT_CHAINS,
} from '@buildeross/constants/chains'
import { fetchIpfsMetadata, type IpfsMetadata } from '@buildeross/ipfs-service'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { type DaoContractAddresses } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { GetServerSideProps } from 'next'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { CoinDetail } from 'src/modules/coin/CoinDetail'
import { NextPageWithLayout } from 'src/pages/_app'
import { isAddress } from 'viem'

interface CoinPageProps {
  coinAddress: AddressType
  chainSlug: string
  chainId: number
  // Coin data - either from ZoraCoin or ClankerToken
  name: string
  symbol: string
  image: string | null
  // DAO info
  daoAddress: AddressType | null
  daoName: string | null
  addresses: DaoContractAddresses | null
  // Pool info
  pairedToken: AddressType | null
  pairedTokenSymbol: string | null
  poolFee: string | null
  // Metadata
  description: string | null
  uri: string | null
  metadata: IpfsMetadata | null
  createdAt: string | null
  // Type
  isClankerToken: boolean
}

const CoinPage: NextPageWithLayout<CoinPageProps> = ({
  coinAddress,
  chainSlug,
  chainId,
  name,
  symbol,
  image,
  daoAddress,
  daoName,
  pairedToken,
  pairedTokenSymbol,
  poolFee,
  description,
  uri,
  metadata,
  createdAt,
  isClankerToken,
}) => {
  const path = `/coin/${chainSlug}/${coinAddress}`

  return (
    <>
      <Meta
        title={`${name} (${symbol})`}
        description={description || `Trade ${name} on Nouns Builder`}
        path={path}
      />
      <CoinDetail
        name={name}
        symbol={symbol}
        image={image}
        coinAddress={coinAddress}
        chainSlug={chainSlug}
        chainId={chainId}
        daoAddress={daoAddress}
        daoName={daoName}
        pairedToken={pairedToken}
        pairedTokenSymbol={pairedTokenSymbol}
        poolFee={poolFee}
        description={description}
        uri={uri}
        metadata={metadata}
        createdAt={createdAt}
        isClankerToken={isClankerToken}
      />
    </>
  )
}

CoinPage.getLayout = (page) => {
  const addresses = page.props?.addresses ?? {}
  const chainId = page.props?.chainId ?? 8453
  const chain =
    PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId) ?? PUBLIC_DEFAULT_CHAINS[0]

  return (
    <DefaultLayout chain={chain} addresses={addresses}>
      {page}
    </DefaultLayout>
  )
}

export default CoinPage

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_INFO
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const coinAddress = params?.coinAddress as string
  const network = params?.network as string

  // Validate chain
  const chain = PUBLIC_ALL_CHAINS.find((x) => x.slug === network)
  if (!chain) {
    return { notFound: true }
  }

  // Check if chain supports coins
  const isChainSupported = COIN_SUPPORTED_CHAIN_IDS.includes(
    chain.id as (typeof COIN_SUPPORTED_CHAIN_IDS)[number]
  )
  if (!isChainSupported) {
    return { notFound: true }
  }

  // Validate address
  if (!isAddress(coinAddress)) {
    return { notFound: true }
  }

  try {
    const sdk = SubgraphSDK.connect(chain.id)

    // Try to fetch as ZoraCoin first
    const zoraCoinResult = await sdk.zoraCoin({
      coinAddress: coinAddress.toLowerCase(),
    })

    if (zoraCoinResult.zoraCoin) {
      const coin = zoraCoinResult.zoraCoin

      // Fetch metadata from IPFS to get image and description
      let metadata: IpfsMetadata | null = null
      if (coin.uri) {
        metadata = await fetchIpfsMetadata(coin.uri)
      }

      // Fetch DAO name if we have a DAO link
      const daoName = coin.dao?.name ?? null
      const daoAddress = coin.dao?.id ? (coin.dao.id as AddressType) : null

      // Fetch DAO addresses if we have a DAO
      let addresses: DaoContractAddresses | null = null
      if (daoAddress) {
        try {
          addresses = await getDAOAddresses(chain.id, daoAddress)
        } catch (error) {
          console.error('Error fetching DAO addresses:', error)
        }
      }

      // Determine paired token symbol (usually the clanker token or WETH)
      const pairedTokenSymbol = coin.clankerToken?.tokenSymbol ?? null

      return {
        props: {
          coinAddress: coin.coinAddress as AddressType,
          chainSlug: chain.slug,
          chainId: chain.id,
          name: coin.name ?? '',
          symbol: coin.symbol ?? '',
          image: metadata?.image ?? metadata?.imageUrl ?? null,
          daoAddress,
          daoName: daoName ?? null,
          addresses,
          pairedToken: coin.currency ? (coin.currency as AddressType) : null,
          pairedTokenSymbol: pairedTokenSymbol ?? null,
          poolFee: coin.poolFee ? `${(Number(coin.poolFee) / 10000).toFixed(2)}%` : null,
          description: metadata?.description ?? null,
          uri: coin.uri ?? null,
          metadata: metadata ?? null,
          createdAt: coin.createdAt ?? null,
          isClankerToken: false,
        },
      }
    }

    // Try to fetch as ClankerToken
    const clankerTokenResult = await sdk.clankerToken({
      tokenAddress: coinAddress.toLowerCase(),
    })

    if (clankerTokenResult.clankerToken) {
      const token = clankerTokenResult.clankerToken

      // Fetch DAO name if we have a DAO link
      const daoName = token.dao?.name ?? null
      const daoAddress = token.dao?.id ? (token.dao.id as AddressType) : null

      // Fetch DAO addresses if we have a DAO
      let addresses: DaoContractAddresses | null = null
      if (daoAddress) {
        try {
          addresses = await getDAOAddresses(chain.id, daoAddress)
        } catch (error) {
          console.error('Error fetching DAO addresses:', error)
        }
      }

      // Parse description from tokenMetadata JSON
      let description: string | null = null
      if (token.tokenMetadata) {
        try {
          const parsed = JSON.parse(token.tokenMetadata)
          description = parsed.description ?? null
        } catch {
          // If parsing fails, use raw metadata as description
          description = token.tokenMetadata
        }
      }

      return {
        props: {
          coinAddress: token.tokenAddress as AddressType,
          chainSlug: chain.slug,
          chainId: chain.id,
          name: token.tokenName ?? '',
          symbol: token.tokenSymbol ?? '',
          image: token.tokenImage ?? null,
          daoAddress,
          daoName: daoName ?? null,
          addresses,
          pairedToken: token.pairedToken ? (token.pairedToken as AddressType) : null,
          pairedTokenSymbol: null, // Would need to look up paired token
          poolFee: null, // ClankerToken doesn't store pool fee directly
          description: description ?? null,
          uri: null, // ClankerToken doesn't store IPFS URI
          metadata: null, // ClankerToken doesn't have IPFS metadata
          createdAt: token.createdAt ?? null,
          isClankerToken: true,
        },
      }
    }

    // Coin not found
    return { notFound: true }
  } catch (error) {
    console.error('Error fetching coin:', error)
    return { notFound: true }
  }
}
