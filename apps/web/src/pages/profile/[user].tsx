import { CACHE_TIMES, SWR_KEYS } from '@buildeross/constants'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SectionHandler } from '@buildeross/dao-ui'
import { Feed } from '@buildeross/feed-ui'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useUserDaos } from '@buildeross/hooks/useUserDaos'
import { FeedEventType, myDaosRequest, tokensQuery } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { CopyButton } from '@buildeross/ui/CopyButton'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Pagination } from '@buildeross/ui/Pagination'
import { getEnsAddress, getEnsName } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { DelegateToProfileButton } from 'src/components/profile/DelegateToProfileButton'
import {
  ProfileActivityFilters,
  type ProfileActivityFiltersValue,
} from 'src/components/profile/ProfileActivityFilters'
import { ProfileIdentityFields } from 'src/components/profile/ProfileIdentityFields'
import { ProfileLinksEditButton } from 'src/components/profile/ProfileLinksEditButton'
import {
  ProfileTokenFilters,
  type ProfileTokenFiltersValue,
} from 'src/components/profile/ProfileTokenFilters'
import { ProfileWalletScannerMenu } from 'src/components/profile/ProfileWalletScannerMenu'
import { ProfileDaoList } from 'src/components/ProfileDaoList'
import { useProfileIdentity } from 'src/hooks/useProfileIdentity'
import { getProfileLayout } from 'src/layouts/ProfileLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import {
  daosContainer,
  loadingSkeleton,
  noTokensContainer,
  profileContentColumn,
  responsiveGrid,
  tokenContainer,
} from 'src/styles/profile.css'
import { TOKEN_SORT_OPTIONS, type TokenSortOption } from 'src/utils/profileIdentity'
import useSWR, { unstable_serialize } from 'swr'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'

interface ProfileProps {
  userAddress: string
  userName: string
  ogImageURL: string
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  label: string
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>

  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    new Promise<T>((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    }),
  ])
}

async function getProfileDaosForOg(userAddress: AddressType) {
  try {
    return await withTimeout(myDaosRequest(userAddress), 5000, 'Profile DAO lookup')
  } catch (error) {
    console.warn('Profile DAO lookup unavailable for OG image:', {
      userAddress,
      error: error instanceof Error ? error.message : error,
    })

    return []
  }
}

async function getProfileEnsName(userAddress: AddressType) {
  try {
    return await withTimeout(getEnsName(userAddress), 3000, 'Profile ENS lookup')
  } catch (error) {
    console.warn('Profile ENS lookup unavailable:', {
      userAddress,
      error: error instanceof Error ? error.message : error,
    })

    return userAddress
  }
}

const ProfilePage: NextPageWithLayout<ProfileProps> = ({
  userAddress,
  userName,
  ogImageURL,
}) => {
  const chain = useChainStore((x) => x.chain)
  const { query, push, pathname } = useRouter()
  const { address: connectedAddress } = useAccount()

  const page = query.page as string
  const activeTab = query.tab ? (query.tab as string) : 'feed'

  const { ensName, ensAvatar } = useEnsData(userAddress)
  const { data: profileIdentity, mutate: mutateProfileIdentity } = useProfileIdentity(
    ensName && !isAddress(ensName, { strict: false }) ? ensName : undefined,
    userAddress as AddressType
  )
  const isOwnProfile = connectedAddress?.toLowerCase() === userAddress.toLowerCase()
  const validTokenSortValues = React.useMemo(
    () => new Set(TOKEN_SORT_OPTIONS.map((option) => option.value)),
    []
  )
  const tokenSort = validTokenSortValues.has(query.tokenSort as TokenSortOption)
    ? (query.tokenSort as TokenSortOption)
    : 'newest'
  const activityTypes = React.useMemo(() => {
    const rawActivityType =
      typeof query.activityType === 'string' ? query.activityType : undefined

    if (!rawActivityType) return []

    return rawActivityType
      .split(',')
      .filter((eventType): eventType is FeedEventType =>
        Object.values(FeedEventType).includes(eventType as FeedEventType)
      )
  }, [query.activityType])
  const activityDao =
    typeof query.activityDao === 'string' && query.activityDao
      ? (query.activityDao as AddressType)
      : undefined
  const activityChainId =
    typeof query.activityChainId === 'string' && query.activityChainId
      ? (Number(query.activityChainId) as CHAIN_ID)
      : undefined
  const selectedDaoKeys = React.useMemo(() => {
    if (typeof query.daoFilters === 'string' && query.daoFilters) {
      return query.daoFilters
        .split(',')
        .map((daoKey) => daoKey.trim().toLowerCase())
        .filter(Boolean)
    }

    const legacyDaoKeys = new Set<string>()

    if (activityDao && activityChainId) {
      legacyDaoKeys.add(`${activityChainId}:${activityDao.toLowerCase()}`)
    }

    if (typeof query.tokenDao === 'string' && query.tokenDao) {
      legacyDaoKeys.add(`${chain.id}:${query.tokenDao.toLowerCase()}`)
    }

    return Array.from(legacyDaoKeys)
  }, [activityChainId, activityDao, chain.id, query.daoFilters, query.tokenDao])

  const selectedDaoFilters = React.useMemo(
    () =>
      selectedDaoKeys
        .map((daoKey) => {
          const [rawChainId, rawAddress] = daoKey.split(':')
          const parsedChainId = Number(rawChainId) as CHAIN_ID

          if (!rawAddress || Number.isNaN(parsedChainId)) return null

          return {
            chainId: parsedChainId,
            address: rawAddress as AddressType,
          }
        })
        .filter(
          (daoFilter): daoFilter is { chainId: CHAIN_ID; address: AddressType } =>
            daoFilter !== null
        ),
    [selectedDaoKeys]
  )

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

  const updateQuery = React.useCallback(
    async (updates: Record<string, string | undefined>, resetPage = false) => {
      const nextQuery = { ...query }

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          nextQuery[key] = value
        } else {
          delete nextQuery[key]
        }
      })

      if (resetPage) delete nextQuery.page

      await push(
        {
          pathname,
          query: nextQuery,
        },
        undefined,
        { shallow: true, scroll: false }
      )
    },
    [pathname, push, query]
  )

  const handleActivityFiltersChange = React.useCallback(
    (value: ProfileActivityFiltersValue) =>
      updateQuery({
        activityType: value.eventTypes.length ? value.eventTypes.join(',') : undefined,
        daoFilters: value.daoKeys.length ? value.daoKeys.join(',') : undefined,
        activityDao: undefined,
        activityChainId: undefined,
        tokenDao: undefined,
        hiddenTokenDaos: undefined,
      }),
    [updateQuery]
  )

  const handleTokenFiltersChange = React.useCallback(
    (value: ProfileTokenFiltersValue) =>
      updateQuery(
        {
          tokenSort: value.sort === 'newest' ? undefined : value.sort,
          daoFilters: value.daoKeys.length ? value.daoKeys.join(',') : undefined,
          activityDao: undefined,
          activityChainId: undefined,
          tokenDao: undefined,
          hiddenTokenDaos: undefined,
        },
        true
      ),
    [updateQuery]
  )

  const handleProfileDaoFilterClick = React.useCallback(
    (dao: { chainId: number; collectionAddress: string }) => {
      const daoKey = `${dao.chainId}:${dao.collectionAddress.toLowerCase()}`
      const nextDaoKeys = selectedDaoKeys.includes(daoKey)
        ? selectedDaoKeys.filter((selectedDaoKey) => selectedDaoKey !== daoKey)
        : [...selectedDaoKeys, daoKey]

      updateQuery({
        daoFilters: nextDaoKeys.length ? nextDaoKeys.join(',') : undefined,
        activityDao: undefined,
        activityChainId: undefined,
        tokenDao: undefined,
        hiddenTokenDaos: undefined,
      })
    },
    [selectedDaoKeys, updateQuery]
  )

  const selectedTokenDaoAddresses = React.useMemo(
    () =>
      selectedDaoFilters
        .filter((daoFilter) => daoFilter.chainId === chain.id)
        .map((daoFilter) => daoFilter.address),
    [chain.id, selectedDaoFilters]
  )

  const { data: tokens, isValidating: isLoadingTokens } = useSWR(
    userAddress && chain.id
      ? ([
          SWR_KEYS.PROFILE_TOKENS,
          chain.id,
          userAddress,
          page,
          tokenSort,
          selectedTokenDaoAddresses.join(','),
        ] as const)
      : undefined,
    ([, _chainId, _userAddress, _page, _tokenSort, _selectedTokenDaoAddresses]) =>
      tokensQuery(_chainId, _userAddress, _page ? parseInt(_page) : undefined, {
        sort: _tokenSort,
        daoAddresses: _selectedTokenDaoAddresses
          ? (_selectedTokenDaoAddresses.split(',') as AddressType[])
          : undefined,
      })
  )

  const { daos, isLoading: isLoadingDaos } = useUserDaos({ address: userAddress })
  const isLoading = isLoadingTokens || isLoadingDaos
  const hasDaos = !!daos && daos.length > 0

  const pageTitle = `${userName}'s Profile`
  const pageDescription = `View ${userName}'s profile and DAO tokens on Nouns Builder`
  const profilePath = `/profile/${userAddress}`

  // Create the Feed section
  const feedSection = {
    title: 'Feed',
    component: [
      <Flex key="feed" w="100%" direction="column" align="center" px="x2">
        <Box w="100%" className={profileContentColumn}>
          <ProfileActivityFilters
            daos={daos}
            value={{
              eventTypes: activityTypes,
              daoKeys: selectedDaoKeys,
            }}
            onChange={handleActivityFiltersChange}
            onReset={() =>
              handleActivityFiltersChange({
                eventTypes: [],
                daoKeys: [],
              })
            }
          />
          <Feed
            actor={userAddress as AddressType}
            eventTypes={activityTypes.length ? activityTypes : undefined}
            daos={
              selectedDaoFilters.length
                ? selectedDaoFilters.map((daoFilter) => daoFilter.address)
                : undefined
            }
            chainIds={
              selectedDaoFilters.length
                ? selectedDaoFilters.map((daoFilter) => daoFilter.chainId)
                : undefined
            }
            emptyMessage={
              activityTypes.length || selectedDaoFilters.length
                ? 'No profile activity matches these filters.'
                : undefined
            }
          />
        </Box>
      </Flex>,
    ],
  }

  // Create the Tokens section
  const tokensSection = {
    title: 'Tokens',
    component: [
      <Box key="tokens" w="100%" px="x2" className={profileContentColumn}>
        {hasDaos && (
          <>
            <ProfileTokenFilters
              daos={daos}
              value={{
                sort: tokenSort,
                daoKeys: selectedDaoKeys,
              }}
              onChange={handleTokenFiltersChange}
              onReset={() =>
                handleTokenFiltersChange({
                  sort: 'newest',
                  daoKeys: [],
                })
              }
            />
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
                  {selectedTokenDaoAddresses.length || tokenSort !== 'newest'
                    ? 'No DAO tokens match these filters.'
                    : page
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
        h={{ '@initial': 'unset', '@768': '100vh' }}
      >
        <Flex
          w="100%"
          direction={{ '@initial': 'column', '@768': 'row' }}
          height={{ '@initial': 'unset', '@768': '100%' }}
          style={{ maxWidth: '1440px' }}
          px={{ '@initial': 'x0', '@768': 'x8' }}
          position={'relative'}
        >
          <Box
            mt={{ '@initial': 'x12', '@768': 'x32' }}
            pr={{ '@768': 'x8' }}
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
              <Flex align="center" gap="x2" wrap mt={{ '@initial': 'x0', '@768': 'x4' }}>
                <Text variant={'heading-md'} position={'relative'}>
                  {ensName || walletSnippet(userAddress)}
                </Text>
                <ProfileLinksEditButton
                  identity={profileIdentity}
                  profileAddress={userAddress as AddressType}
                  onSaved={() => mutateProfileIdentity()}
                />
              </Flex>
            </Flex>

            <Flex
              align="center"
              gap="x2"
              wrap
              mt={{ '@initial': 'x2', '@768': undefined }}
            >
              <Flex
                align={'center'}
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
                <ProfileWalletScannerMenu address={userAddress as AddressType} />
              </Flex>
            </Flex>

            <ProfileIdentityFields identity={profileIdentity} />

            <Flex mt="x8" direction="column" align="flex-start">
              {isLoadingDaos ? (
                <Box
                  backgroundColor="background2"
                  h="x6"
                  w="100%"
                  className={loadingSkeleton}
                  borderRadius="normal"
                />
              ) : daos && daos?.length > 0 ? (
                <ProfileDaoList
                  activeDaoKeys={selectedDaoKeys}
                  daos={daos}
                  headerAction={
                    <DelegateToProfileButton
                      profileAddress={userAddress as AddressType}
                      profileName={ensName || walletSnippet(userAddress)}
                    />
                  }
                  isOwnProfile={isOwnProfile}
                  onDaoClick={handleProfileDaoFilterClick}
                  userAddress={userAddress}
                />
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

  const ensName = isAddress(user)
    ? await getProfileEnsName(userAddress as AddressType)
    : user

  const userName = isAddress(ensName) ? walletSnippet(userAddress) : ensName

  const daos = await getProfileDaosForOg(userAddress as AddressType)

  const sortedDaos = daos?.sort((a, b) => {
    const aIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === a.chainId)
    const bIndex = PUBLIC_DEFAULT_CHAINS.findIndex((chain) => chain.id === b.chainId)
    return aIndex - bIndex
  })

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
    [unstable_serialize([SWR_KEYS.MY_DAOS, userAddress.toLowerCase()])]: sortedDaos,
  }

  return {
    props: { userAddress, userName, ogImageURL, fallback },
  }
}
