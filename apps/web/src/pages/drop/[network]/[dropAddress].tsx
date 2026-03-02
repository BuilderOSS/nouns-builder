import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_ALL_CHAINS, PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import {
  type ZoraDropFragment,
  type ZoraDropWithHoldersFragment,
  zoraDropWithHoldersRequest,
} from '@buildeross/sdk/subgraph'
import { type DaoContractAddresses } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { GetServerSideProps } from 'next'
import { Meta } from 'src/components/Meta'
import { DefaultLayout } from 'src/layouts/DefaultLayout'
import { LayoutWrapper } from 'src/layouts/LayoutWrapper'
import { DropDetail } from 'src/modules/drop/DropDetail'
import { NextPageWithLayout } from 'src/pages/_app'
import { isAddress } from 'viem'

interface DropPageProps {
  drop: ZoraDropFragment
  chainSlug: string
  chainId: number
  daoAddress: AddressType | null
  daoName: string | null
  daoImage: string | null
  addresses: DaoContractAddresses | null
  transactionHash: string | null
  holders?: Array<{
    holder: `0x${string}`
    balance: string
    totalSpent?: string
    totalPurchased?: string
  }>
}

const DropPage: NextPageWithLayout<DropPageProps> = ({
  drop,
  chainSlug,
  chainId,
  daoAddress,
  daoName,
  daoImage,
  transactionHash,
  holders,
}) => {
  const path = `/drop/${chainSlug}/${drop.id}`

  return (
    <>
      <Meta
        title={`${drop.name} (${drop.symbol})`}
        description={drop.description || `Mint ${drop.name} on Nouns Builder`}
        path={path}
      />
      <DropDetail
        drop={drop}
        chainId={chainId}
        daoAddress={daoAddress}
        daoName={daoName}
        daoImage={daoImage}
        transactionHash={transactionHash}
        holders={holders}
      />
    </>
  )
}

DropPage.getLayout = (page) => {
  const addresses = page.props?.addresses ?? {}
  const chainId = page.props?.chainId ?? 8453
  const chain =
    PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId) ?? PUBLIC_DEFAULT_CHAINS[0]

  return (
    <LayoutWrapper>
      <DefaultLayout chain={chain} addresses={addresses} hideFooterOnMobile>
        {page}
      </DefaultLayout>
    </LayoutWrapper>
  )
}

export default DropPage

export const getServerSideProps: GetServerSideProps = async ({ res, params }) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_INFO
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const dropAddress = params?.dropAddress as string
  const network = params?.network as string

  // Validate chain
  const chain = PUBLIC_ALL_CHAINS.find((x) => x.slug === network)
  if (!chain) {
    return { notFound: true }
  }

  // Validate address
  if (!isAddress(dropAddress)) {
    return { notFound: true }
  }

  try {
    // Fetch drop data with holders
    const drop = await zoraDropWithHoldersRequest(dropAddress, chain.id)

    if (!drop) {
      return { notFound: true }
    }

    const dropWithHolders = drop as ZoraDropWithHoldersFragment

    // Extract DAO info
    const daoAddress = (drop.dao?.id as AddressType) ?? null
    const daoName = drop.dao?.name ?? null
    const daoImage = drop.dao?.contractImage ?? null

    // Fetch DAO addresses
    let addresses: DaoContractAddresses | null = null
    if (daoAddress) {
      try {
        addresses = await getDAOAddresses(chain.id, daoAddress)
      } catch (error) {
        console.error('Error fetching DAO addresses:', error)
      }
    }

    // Extract holders data
    const holders =
      dropWithHolders.holders?.map((h) => ({
        holder: h.holder as `0x${string}`,
        balance: h.balance.toString(),
        totalSpent: h.totalSpent?.toString(),
        totalPurchased: h.totalPurchased?.toString(),
      })) ?? []

    return {
      props: {
        drop,
        chainSlug: chain.slug,
        chainId: chain.id,
        daoAddress,
        daoName,
        daoImage,
        addresses,
        transactionHash: (drop.transactionHash as `0x${string}`) ?? null,
        holders,
      },
    }
  } catch (error) {
    console.error('Error fetching drop:', error)
    return { notFound: true }
  }
}
