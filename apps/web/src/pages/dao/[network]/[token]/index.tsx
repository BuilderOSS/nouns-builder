import { ERC721_REDEEM_MINTER, MERKLE_RESERVE_MINTER } from '@buildeross/constants'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  About,
  Activity,
  ERC721RedeemMinterForm,
  MerkleReserveMinterForm,
  PreAuction,
  PreAuctionForm,
  SectionHandler,
  SmartContracts,
} from '@buildeross/dao-ui'
import { auctionAbi, getDAOAddresses, tokenAbi } from '@buildeross/sdk/contract'
import { OrderDirection, SubgraphSDK, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { DaoContractAddresses, useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { serverConfig } from '@buildeross/utils/wagmi/serverConfig'
import { atoms, Button, Flex, Heading, Stack, Text, theme } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import NogglesLogo from 'src/layouts/assets/builder-framed.svg'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { isAddress, zeroAddress } from 'viem'
import { useAccount, useConfig, useReadContracts, useWriteContract } from 'wagmi'
import { readContract, waitForTransactionReceipt } from 'wagmi/actions'

interface DaoPageProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  collectionAddress: AddressType
}

const isValidAddress = (address: AddressType | undefined) =>
  !!address && isAddress(address, { strict: false }) && address !== zeroAddress

const DaoPage: NextPageWithLayout<DaoPageProps> = ({ chainId, collectionAddress }) => {
  const { query, pathname, push } = useRouter()

  const { address: signerAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

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

  const { data: contractData } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...auctionContractParams, functionName: 'owner' },
      { ...tokenContractParams, functionName: 'remainingTokensInReserve' },
      {
        ...tokenContractParams,
        functionName: 'minter',
        args: [MERKLE_RESERVE_MINTER[chain.id]],
      },
      {
        ...tokenContractParams,
        functionName: 'minter',
        args: [ERC721_REDEEM_MINTER[chain.id]],
      },
    ] as const,
  })

  const [owner, remainingTokensInReserve, isMerkleReserveMinter, isERC721RedeemMinter] =
    unpackOptionalArray(contractData, 4)

  const [showMinterModal, setShowMinterModal] = React.useState(false)
  const [isSettingUpMinter, setIsSettingUpMinter] = React.useState(false)

  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const merkleMinter = MERKLE_RESERVE_MINTER[chain.id]
  const redeemMinter = ERC721_REDEEM_MINTER[chain.id]

  const shouldShowMinterModal = React.useMemo(
    () =>
      !!remainingTokensInReserve &&
      remainingTokensInReserve > 0n &&
      !isMerkleReserveMinter &&
      !isERC721RedeemMinter &&
      (isValidAddress(merkleMinter) || isValidAddress(redeemMinter)),
    [
      remainingTokensInReserve,
      isMerkleReserveMinter,
      isERC721RedeemMinter,
      merkleMinter,
      redeemMinter,
    ]
  )

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

  const handleSetupMinter = React.useCallback(
    async (minterType: 'merkle' | 'redeem') => {
      setIsSettingUpMinter(true)

      try {
        const minterAddr =
          minterType === 'merkle'
            ? MERKLE_RESERVE_MINTER[chain.id]
            : ERC721_REDEEM_MINTER[chain.id]

        if (!isValidAddress(minterAddr)) {
          throw new Error('Invalid minter address')
        }

        // Directly simulate and write
        const txHash = await writeContractAsync({
          abi: tokenAbi,
          address: addresses.token!,
          functionName: 'updateMinters',
          args: [[{ minter: minterAddr, allowed: true }]],
          chainId: chain.id,
        })

        if (txHash) {
          await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
        }

        setIsSettingUpMinter(false)
        setShowMinterModal(false)

        // Navigate to the appropriate tab
        const tab = minterType === 'merkle' ? 'merkle-reserve' : 'erc721-redeem'
        await openTab(tab)
      } catch (e) {
        console.error(e)
        setIsSettingUpMinter(false)
      }
    },
    [chain.id, addresses.token, config, writeContractAsync, openTab]
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

  const openProposalCreatePage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/create`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const openProposalReviewPage = React.useCallback(async () => {
    await push({
      pathname: `/dao/[network]/[token]/proposal/review`,
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }, [push, chain.slug, addresses.token])

  const sections = React.useMemo(() => {
    const aboutSection = {
      title: 'About',
      component: [<About key={'about'} />],
    }
    const baseSections = [
      aboutSection,
      {
        title: 'Activity',
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

    return [
      ...baseSections,
      ...minterSections,
      {
        title: 'Smart Contracts',
        component: [<SmartContracts key={'smart_contracts'} />],
      },
    ]
  }, [
    isMerkleReserveMinter,
    isERC721RedeemMinter,
    openProposalCreatePage,
    openProposalReviewPage,
  ])

  if (!owner) {
    return null
  }

  const isOwner = owner === signerAddress || true

  if (!isOwner) {
    return (
      <Flex direction={'column'} align={'center'} width={'100%'} height={'100vh'}>
        <Flex mt={'x64'} direction="column" align={'center'}>
          <NogglesLogo
            fill={theme.colors.text4}
            className={atoms({ width: 'x23', cursor: 'pointer' })}
          />
          <Text mt={'x2'} color="text4">
            There’s nothing here yet
          </Text>
        </Flex>
      </Flex>
    )
  }

  const activeTab = query.tab ? (query.tab as string) : 'activity'
  const path = `/dao/${chain.slug}/${addresses.token}/?tab=${activeTab}`

  return (
    <Flex direction="column" pb="x30">
      <Meta title={'dao page'} path={path} />

      <PreAuction
        chain={chain}
        collectionAddress={collectionAddress}
        onOpenAuction={openTokenPage}
        onOpenSettings={() => openTab('admin')}
        remainingTokensInReserve={remainingTokensInReserve}
        shouldShowMinterModal={shouldShowMinterModal}
        openMinterModal={() => setShowMinterModal(true)}
      />

      <SectionHandler
        sections={sections}
        activeTab={activeTab}
        onTabChange={(tab) => openTab(tab, false)}
      />

      <AnimatedModal
        open={showMinterModal}
        close={() => setShowMinterModal(false)}
        size="medium"
      >
        <Flex direction="column" p="x6" gap="x4">
          <Heading size="lg">Setup Custom Minter</Heading>
          <Text color="text3">
            You have {remainingTokensInReserve?.toString()} tokens in reserve. Choose a
            minter to configure how these tokens will be distributed.
          </Text>
          <Text color="text4" fontSize="14" mt="x2">
            This will enable the selected minter contract to mint tokens from your
            reserve.
          </Text>
          <Stack gap="x3" mt="x4">
            {isValidAddress(redeemMinter) && (
              <Button
                onClick={() => handleSetupMinter('redeem')}
                disabled={isSettingUpMinter || !signerAddress}
                loading={isSettingUpMinter}
                variant="secondary"
                style={{ width: '100%' }}
              >
                Setup ERC721 Redeem Minter
              </Button>
            )}
            {isValidAddress(merkleMinter) && (
              <Button
                onClick={() => handleSetupMinter('merkle')}
                disabled={isSettingUpMinter || !signerAddress}
                loading={isSettingUpMinter}
                style={{ width: '100%' }}
                variant="secondary"
              >
                Setup Merkle Reserve Minter
              </Button>
            )}
          </Stack>
        </Flex>
      </AnimatedModal>
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
