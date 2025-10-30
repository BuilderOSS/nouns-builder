import { BASE_URL, CACHE_TIMES, SWR_KEYS } from '@buildeross/constants'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SectionHandler } from '@buildeross/dao-ui'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { myDaosRequest, tokensQuery } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { Avatar, DaoAvatar } from '@buildeross/ui/Avatar'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Feed } from '@buildeross/ui/Feed'
import { Pagination } from '@buildeross/ui/Pagination'
import { getEnsAddress, getEnsName } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import NextImage from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { getProfileLayout } from 'src/layouts/ProfileLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import {
  daosContainer,
  loadingSkeleton,
  noTokensContainer,
  profileDaoLink,
  responsiveGrid,
  tokenContainer,
} from 'src/styles/profile.css'
import useSWR, { unstable_serialize } from 'swr'
import { isAddress } from 'viem'

interface ProfileProps {
  userAddress: string
  userName: string
  ogImageURL: string
}

const ProfilePage: NextPageWithLayout<ProfileProps> = ({
  userAddress,
  userName,
  ogImageURL,
}) => {
  const chain = useChainStore((x) => x.chain)
  const { query, push, pathname } = useRouter()

  const page = query.page as string

  const { ensName, ensAvatar } = useEnsData(userAddress)

  const openTab = React.useCallback(
    async (tab: string, scroll?: boolean) => {
      const nextQuery = { ...query }
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

  const { data: tokens, isValidating: isLoadingTokens } = useSWR(
    userAddress && chain.id
      ? ([SWR_KEYS.PROFILE_TOKENS, chain.id, userAddress, page] as const)
      : undefined,
    ([, _chainId, _userAddress, _page]) =>
      tokensQuery(_chainId, _userAddress, _page ? parseInt(_page) : undefined)
  )

  const { data: daos, isValidating: isLoadingDaos } = useSWR(
    userAddress
      ? ([SWR_KEYS.PROFILE_DAOS, userAddress.toLowerCase()] as const)
      : undefined,
    ([, _userAddress]) => myDaosRequest(_userAddress)
  )

  const isLoading = isLoadingTokens || isLoadingDaos
  const hasDaos = !!daos && daos.length > 0

  const pageTitle = `${userName}'s Profile`
  const pageDescription = `View ${userName}'s profile and DAO tokens on Nouns Builder`
  const profilePath = `/profile/${userAddress}`

  const activeTab = query.tab ? (query.tab as string) : 'feed'

  // Create the Feed section
  const feedSection = {
    title: 'Feed',
    component: [
      <Flex key="feed" w="100%" direction="column" align="center">
        <Box w="100%" style={{ maxWidth: '912px' }}>
          <Feed actor={userAddress as AddressType} chainId={chain.id} />
        </Box>
      </Flex>,
    ],
  }

  // Create the Tokens section
  const tokensSection = {
    title: 'Tokens',
    component: [
      <Box key="tokens" w="100%">
        {hasDaos && (
          <>
            {isLoadingTokens ? (
              <Grid className={responsiveGrid} gap={'x12'}>
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Box
                      key={i}
                      backgroundColor="background2"
                      borderRadius="curved"
                      width={'100%'}
                      height={'100%'}
                      aspectRatio={1 / 1}
                      position="relative"
                      className={loadingSkeleton}
                    />
                  ))}
              </Grid>
            ) : !!tokens?.tokens.length ? (
              <Grid className={responsiveGrid} gap={'x12'}>
                {tokens?.tokens.map((x, i) => (
                  <Link
                    key={i}
                    href={`/dao/${chain.slug}/${x.tokenContract}/${x.tokenId}`}
                  >
                    <Box>
                      <Box
                        backgroundColor="background2"
                        width={'100%'}
                        height={'auto'}
                        aspectRatio={1 / 1}
                        position="relative"
                        borderRadius="curved"
                        overflow="hidden"
                      >
                        <FallbackImage src={x.image} sizes="100vw" alt={x.name} />
                      </Box>
                      <Text variant="heading-xs" mt="x4">
                        {x.name}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </Grid>
            ) : (
              <Flex
                align={'center'}
                justify={'space-around'}
                className={noTokensContainer}
              >
                <Text color="text3">
                  {page
                    ? `No more DAO tokens found on ${chain.name}.`
                    : `No DAO tokens found on ${chain.name}.`}
                </Text>
              </Flex>
            )}

            <Pagination hasNextPage={tokens?.hasNextPage} />
          </>
        )}

        {!isLoading && !hasDaos && (
          <Flex align={'center'} justify={'space-around'} className={noTokensContainer}>
            <Text color="text3">No DAO tokens owned.</Text>
          </Flex>
        )}
      </Box>,
    ],
  }

  const sections = [feedSection, tokensSection]

  return (
    <>
      <Meta
        title={pageTitle}
        type={`${userName}:profile`}
        path={profilePath}
        description={pageDescription}
        image={ogImageURL}
      />
      <Flex
        align={'center'}
        top={'x0'}
        left={'x0'}
        justify={'space-around'}
        width="100%"
        position={{ '@initial': 'relative', '@768': 'fixed' }}
        px={{ '@initial': 'x0', '@768': 'x8' }}
        h={{ '@initial': 'unset', '@768': '100vh' }}
      >
        <Flex
          w="100%"
          direction={{ '@initial': 'column', '@768': 'row' }}
          height={{ '@initial': 'unset', '@768': '100%' }}
          style={{ maxWidth: '1440px' }}
          position={'relative'}
        >
          <Box
            mt={{ '@initial': 'x12', '@768': 'x32' }}
            pr={{ '@768': 'x8', '@1024': 'x16' }}
            className={daosContainer}
          >
            <Flex
              align={{ '@initial': 'center', '@768': 'flex-start' }}
              direction={{ '@initial': 'row', '@768': 'column' }}
            >
              <Avatar
                mr={{ '@initial': 'x2', '@768': undefined }}
                address={userAddress}
                src={ensAvatar}
                size="80"
              />
              <Text
                variant={'heading-md'}
                position={'relative'}
                mt={{ '@initial': 'x0', '@768': 'x4' }}
              >
                {ensName || walletSnippet(userAddress)}
              </Text>
            </Flex>

            <Flex
              align={'center'}
              mt={{ '@initial': 'x2', '@768': undefined }}
              py="x1"
              px="x2"
              borderRadius="curved"
              borderStyle="solid"
              borderWidth={'thin'}
              borderColor={'border'}
              style={{ width: 'fit-content' }}
            >
              <Text mr="x2" color="text3">
                {walletSnippet(userAddress)}
              </Text>
              <CopyButton text={userAddress} />
            </Flex>

            <Flex mt="x8" direction="column" align="flex-start">
              <Text mb="x4" fontWeight={'display'}>
                DAOs
              </Text>
              {isLoadingDaos ? (
                <Box
                  backgroundColor="background2"
                  h="x6"
                  w="100%"
                  className={loadingSkeleton}
                  borderRadius="normal"
                />
              ) : daos && daos?.length > 0 ? (
                <Flex direction="column" gap="x3" w="100%">
                  {daos.map((dao) => {
                    const chainMeta = PUBLIC_DEFAULT_CHAINS.find(
                      (chain) => chain.id === dao.chainId
                    )
                    return (
                      <Link
                        key={dao.collectionAddress}
                        href={`${BASE_URL}/dao/${chainMeta?.slug}/${dao.collectionAddress}`}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          width: '100%',
                        }}
                      >
                        <Flex
                          align="center"
                          gap="x3"
                          p="x3"
                          borderRadius="curved"
                          borderStyle="solid"
                          borderWidth="thin"
                          borderColor="border"
                          cursor="pointer"
                          style={{
                            transition: 'all 0.2s ease',
                          }}
                          className={profileDaoLink}
                        >
                          <DaoAvatar
                            collectionAddress={dao.collectionAddress}
                            size="48"
                            auctionAddress={dao.auctionAddress}
                            chainId={dao.chainId}
                          />
                          <Flex align="center" justify="space-between" flex="1">
                            <Text fontWeight="display">{dao.name}</Text>
                            <Flex align="center" gap="x1">
                              {chainMeta?.icon && (
                                <NextImage
                                  src={chainMeta.icon}
                                  layout="fixed"
                                  objectFit="contain"
                                  style={{ borderRadius: '12px', maxHeight: '16px' }}
                                  alt=""
                                  height={16}
                                  width={16}
                                />
                              )}
                              <Text fontSize={12} color="text3">
                                {chainMeta?.name}
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Link>
                    )
                  })}
                </Flex>
              ) : (
                <Text>No DAO tokens owned.</Text>
              )}
            </Flex>
          </Box>
          <Box
            mt={{ '@initial': 'x14', '@768': 'x32' }}
            w="100%"
            className={tokenContainer}
            pb={{ '@initial': 'x10', '@768': 'x32' }}
          >
            <SectionHandler
              sections={sections}
              activeTab={activeTab}
              onTabChange={(tab) => openTab(tab, false)}
            />
          </Box>
        </Flex>
      </Flex>
    </>
  )
}

ProfilePage.getLayout = getProfileLayout

export default ProfilePage

export const getServerSideProps: GetServerSideProps = async ({ params, res, req }) => {
  const user = params?.user as string

  const env = process.env.VERCEL_ENV || 'development'
  const protocol = env === 'development' ? 'http' : 'https'

  const { maxAge, swr } = CACHE_TIMES.PROFILE
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const userAddress = isAddress(user) ? user : await getEnsAddress(user)

  if (!userAddress)
    return {
      notFound: true,
    }

  const ensName = isAddress(user) ? await getEnsName(user) : user

  const userName = isAddress(ensName) ? walletSnippet(userAddress) : ensName

  const daos = await myDaosRequest(userAddress)
  const topDaos = daos?.slice(0, 3) ?? []

  const data = {
    daos: topDaos.map((x) => ({
      collectionAddress: x.collectionAddress,
      name: x.name,
      contractImage: x.contractImage,
    })),
  }

  const ogImageURL = `${protocol}://${req.headers.host}/api/og/profile?address=${userAddress}&data=${encodeURIComponent(JSON.stringify(data))}`

  const fallback = {
    [unstable_serialize([SWR_KEYS.PROFILE_DAOS, userAddress.toLowerCase()])]: daos,
  }

  return {
    props: { userAddress, userName, ogImageURL, fallback },
  }
}
