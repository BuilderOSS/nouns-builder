import { ERC721_REDEEM_MINTER, MERKLE_RESERVE_MINTER } from '@buildeross/constants'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  About,
  Activity,
  CustomMinterForm,
  ERC721RedeemMinterForm,
  MerkleReserveMinterForm,
  MinterManagementModal,
  PreAuction,
  PreAuctionForm,
  SectionHandler,
  SmartContracts,
} from '@buildeross/dao-ui'
import { auctionAbi, getDAOAddresses, tokenAbi } from '@buildeross/sdk/contract'
import { OrderDirection, SubgraphSDK, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { DaoContractAddresses, useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID, ProposalCreateStage } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { Box, Flex, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { isAddress } from 'viem'
import { useAccount, useReadContract, useReadContracts } from 'wagmi'
import { readContract } from 'wagmi/actions'

interface DaoPageProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  collectionAddress: AddressType
}

const DaoPage: NextPageWithLayout<DaoPageProps> = ({ chainId, collectionAddress }) => {
  const { query, pathname, push } = useRouter()

  const { address: signerAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const chainIdKey = chain.id as keyof typeof MERKLE_RESERVE_MINTER
  const merkleMinter = MERKLE_RESERVE_MINTER[chainIdKey]
  const redeemMinter = ERC721_REDEEM_MINTER[chainIdKey]

  const auctionContractParams = {
    abi: auctionAbi,
    address: addresses.auction,
    chainId: chainId,
  }

  const tokenContractParams = {
    abi: tokenAbi,
    address: addresses.token as AddressType,
    chainId: chain.id,
  }

  const contracts = [
    { ...auctionContractParams, functionName: 'owner' as const },
    { ...tokenContractParams, functionName: 'remainingTokensInReserve' as const },
    ...(merkleMinter
      ? ([
        {
          ...tokenContractParams,
          functionName: 'minter' as const,
          args: [merkleMinter] as const,
        },
      ] as const)
      : []),
    ...(redeemMinter
      ? ([
        {
          ...tokenContractParams,
          functionName: 'minter' as const,
          args: [redeemMinter] as const,
        },
      ] as const)
      : []),
  ]

  const { data: contractData } = useReadContracts({
    allowFailure: false,
    contracts,
  })

  const [owner, remainingTokensInReserve, ...minterStatus] = (unpackOptionalArray(
    contractData,
    contracts.length
  ) ?? []) as [unknown, bigint | undefined, ...unknown[]]
  const isMerkleReserveMinter = merkleMinter ? !!minterStatus[0] : false
  const isERC721RedeemMinter = redeemMinter ? !!minterStatus[merkleMinter ? 1 : 0] : false

  // Separate read for signer minter status
  const { data: isSignerMinter } = useReadContract({
    ...tokenContractParams,
    functionName: 'minter',
    args: [signerAddress!],
    query: {
      enabled: !!signerAddress,
    },
  })

  // Check if signer address is a minter - show custom minter tab if true
  const isSignerCustomMinter = !!signerAddress && !!isSignerMinter

  // Check governor version for candidates feature (requires >= 3.0.0)
  const { data: governorVersion } = useReadContract({
    abi: [
      {
        inputs: [],
        name: 'contractVersion',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: addresses.governor,
    functionName: 'contractVersion',
    chainId: chain.id,
  })

  const supportsCandidates = React.useMemo(() => {
    if (!governorVersion) return false
    const version = governorVersion as string
    // Check if version >= 3.0.0
    const [major] = version.split('.').map(Number)
    return major >= 3
  }, [governorVersion])

  const [showMinterModal, setShowMinterModal] = React.useState(false)

  const openTab = React.useCallback(
    async (tab: string, scroll?: boolean) => {
      const nextQuery = { ...query } // Get existing query params
      nextQuery['tab'] = tab

      await push(
        {
          pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true, scroll }
      )
    },
    [push, pathname, query]
  )

  const handleMinterEnabled = React.useCallback(
    async (minterAddress: AddressType) => {
      // Navigate to appropriate tab when minter is enabled
      if (merkleMinter && minterAddress === merkleMinter) {
        await openTab('merkle-reserve')
      } else if (redeemMinter && minterAddress === redeemMinter) {
        await openTab('erc721-redeem')
      }
    },
    [merkleMinter, redeemMinter, openTab]
  )

  const openTokenPage = React.useCallback(
    async (tokenId: number) => {
      await push({
        pathname: `/dao/[network]/[token]/[tokenId]`,
        query: {
          network: chain.slug,
          token: addresses.token,
          tokenId: tokenId.toString(),
        },
      })
    },
    [push, chain.slug, addresses.token]
  )

  const openProposalCreatePage = React.useCallback(
    async (stage?: ProposalCreateStage) => {
      await push({
        pathname: `/dao/[network]/[token]/proposal/create`,
        query: {
          network: chain.slug,
          token: addresses.token,
          ...(stage ? { stage } : {}),
        },
      })
    },
    [push, chain.slug, addresses.token]
  )

  const openProposalReviewPage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const isOwner = owner === signerAddress

  const sections = React.useMemo(() => {
    const aboutSection = {
      title: 'About',
      component: [<About key={'about'} />],
    }

    const contractsSection = {
      title: 'Contracts',
      component: [<SmartContracts key={'smart_contracts'} />],
    }

    // Non-owner sections (read-only)
    if (!isOwner) {
      return [aboutSection, contractsSection]
    }

    // Owner sections (full access)
    const ownerSections = [
      {
        title: 'Admin',
        component: [<PreAuctionForm key={'admin'} />],
      },
      aboutSection,
      {
        title: supportsCandidates ? 'Proposals' : 'Activity',
        component: [
          <Activity
            key={'proposals'}
            onOpenProposalCreate={openProposalCreatePage}
            onOpenProposalReview={openProposalReviewPage}
          />,
        ],
      },
      {
        title: 'Admin',
        component: [<PreAuctionForm key={'admin'} />],
      },
    ]

    const minterSections = []

    if (isMerkleReserveMinter) {
      minterSections.push({
        title: 'Merkle Reserve',
        component: [<MerkleReserveMinterForm key={'merkle_reserve_minter'} />],
      })
    }

    if (isERC721RedeemMinter) {
      minterSections.push({
        title: 'Erc721 Redeem',
        component: [<ERC721RedeemMinterForm key={'erc721_redeem_minter'} />],
      })
    }

    if (isSignerCustomMinter) {
      minterSections.push({
        title: 'Custom Minter',
        component: [<CustomMinterForm key={'custom_minter'} />],
      })
    }

    return [...ownerSections, ...minterSections, contractsSection]
  }, [
    isOwner,
    isMerkleReserveMinter,
    isERC721RedeemMinter,
    isSignerCustomMinter,
    supportsCandidates,
    openProposalCreatePage,
    openProposalReviewPage,
  ])

  if (!owner) {
    return null
  }

  const defaultTab = query.tab ? (query.tab as string) : isOwner ? 'admin' : 'about'

  // Normalize tab - both 'activity' and 'proposals' should map to the proposals/activity section
  const rawTab = defaultTab
    ? defaultTab
    : supportsCandidates
      ? 'proposals'
      : 'activity'
  const activeTab =
    rawTab === 'proposals' && supportsCandidates
      ? 'proposals'
      : rawTab === 'activity'
        ? supportsCandidates
          ? 'proposals'
          : 'activity'
        : rawTab
  const path = `/dao/${chain.slug}/${addresses.token}/?tab=${activeTab}`

  return (
    <Flex direction="column" pb="x30">
      <Meta title={'dao page'} path={path} />

      {!isOwner && (
        <Flex mt="x6" mb="x6" mx="auto" width="100%" style={{ maxWidth: '912px' }}>
          <Box
            width="100%"
            borderRadius="curved"
            borderStyle="solid"
            borderWidth="normal"
            borderColor="border"
            backgroundColor="background2"
            p="x6"
          >
            <Text fontSize={16} fontWeight="label" mb="x2">
              Auctions are currently paused
            </Text>
            <Text fontSize={14} color="text3">
              This DAO has not been initialized yet. Please contact the DAO owner to
              initialize and start auctions.
            </Text>
          </Box>
        </Flex>
      )}

      {isOwner && (
        <PreAuction
          chain={chain}
          collectionAddress={collectionAddress}
          onOpenAuction={openTokenPage}
          onOpenSettings={() => openTab('admin')}
          remainingTokensInReserve={remainingTokensInReserve}
          openMinterModal={() => setShowMinterModal(true)}
        />
      )}

      <SectionHandler
        sections={sections}
        activeTab={activeTab}
        onTabChange={(tab) => openTab(tab, false)}
      />

      {isOwner && (
        <MinterManagementModal
          open={showMinterModal}
          close={() => setShowMinterModal(false)}
          remainingTokensInReserve={remainingTokensInReserve}
          isMerkleReserveMinter={isMerkleReserveMinter}
          isERC721RedeemMinter={isERC721RedeemMinter}
          onMinterEnabled={handleMinterEnabled}
        />
      )}
    </Flex>
  )
}

DaoPage.getLayout = getDaoLayout

export default DaoPage

export const getServerSideProps: GetServerSideProps = async ({ res, params, query }) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_INFO
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const collectionAddress = params?.token as AddressType
  const network = params?.network as string
  const tab = query.tab as string
  const referral = query.referral as string
  const message = query.message as string

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!isAddress(collectionAddress) || !chain) {
    return {
      notFound: true,
    }
  }

  try {
    const addresses = await getDAOAddresses(chain.id, collectionAddress)
    if (!addresses) {
      return {
        notFound: true,
      }
    }

    const latestTokenId = await SubgraphSDK.connect(chain.id)
      .tokens({
        where: {
          dao: collectionAddress.toLowerCase(),
        },
        orderBy: Token_OrderBy.TokenId,
        orderDirection: OrderDirection.Desc,
        first: 1,
      })
      .then((x) => (x.tokens.length > 0 ? x.tokens[0].tokenId : undefined))

    const owner = await readContract(serverConfig, {
      abi: auctionAbi,
      address: addresses.auction as AddressType,
      functionName: 'owner',
      chainId: chain.id,
    })

    const initialized: boolean =
      owner === addresses.treasury && latestTokenId !== undefined

    if (!initialized) {
      return {
        props: {
          chainId: chain.id,
          addresses,
          collectionAddress,
        },
      }
    }

    if (!tab && !referral) {
      return {
        redirect: {
          destination: `/dao/${network}/${collectionAddress}/${latestTokenId}`,
          permanent: false,
        },
      }
    }

    const params = new URLSearchParams()
    if (tab) params.set('tab', tab)
    if (referral) params.set('referral', referral)
    if (message) params.set('message', message)

    return {
      redirect: {
        destination: `/dao/${network}/${collectionAddress}/${latestTokenId}?${params.toString()}`,
        permanent: false,
      },
    }
  } catch (e) {
    return {
      notFound: true,
    }
  }
}
