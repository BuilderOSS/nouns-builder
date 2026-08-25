import { BASE_URL, CACHE_TIMES, SWR_KEYS } from '@buildeross/constants'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { useUserDaos } from '@buildeross/hooks/useUserDaos'
import {
  myDaosRequest,
  type ProfileDashboardChainResult,
  type ProfileDashboardQueryMode,
} from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID, FeedItem } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { getEnsAddress, getEnsName } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { withTimeout } from '@buildeross/utils/withTimeout'
import { Flex, Text } from '@buildeross/zord'
import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { Meta } from 'src/components/Meta'
import { ProfileActivityPanel } from 'src/components/profile/ProfileActivityPanel'
import { ProfileDaoSelector } from 'src/components/profile/ProfileDaoSelector'
import { ProfileIdentityFields } from 'src/components/profile/ProfileIdentityFields'
import { ProfileTokenGallery } from 'src/components/profile/ProfileTokenGallery'
import { ProfileWalletScannerMenu } from 'src/components/profile/ProfileWalletScannerMenu'
import { useProfileIdentity } from 'src/hooks/useProfileIdentity'
import { getProfileLayout } from 'src/layouts/ProfileLayout'
import type { NextPageWithLayout } from 'src/pages/_app'
import {
  profileDashboardGrid,
  profileHeaderCopyRow,
  profileHeaderDisplayName,
  profileHeaderIdentity,
  profileHeaderIdentityContent,
  profileHeaderMain,
  profileHeaderNameRow,
  profileHeaderRight,
  profileHeaderSurface,
  profileHeaderTopRow,
  profilePage,
  profileStat,
  profileStatLabel,
  profileStats,
  profileStatValue,
  profileSurface,
  profileWalletAddress,
} from 'src/styles/profile.css'
import {
  createDaoKey,
  dedupeProfileTokens,
  isOwnProfileAddress,
  parseDaoKeys,
  type ProfileToken,
  toggleDaoSelection,
} from 'src/utils/profileDashboard'
import { TOKEN_SORT_OPTIONS, type TokenSortOption } from 'src/utils/profileIdentity'
import useSWR, { unstable_serialize } from 'swr'
import { isAddress } from 'viem'
import { useAccount } from 'wagmi'

interface ProfileProps {
  userAddress: string
  userName: string
  ogImageURL: string
}

type ProfileDashboardResponse = {
  mode: ProfileDashboardQueryMode
  chains: Array<{
    chainId: CHAIN_ID
    chainName: string
    chainSlug: string
    result?: Omit<ProfileDashboardChainResult, 'counts'> & {
      counts: ProfileDashboardChainResult['counts'] & { tokenHoldings?: number }
    }
    error?: string
  }>
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

const dashboardFetcher = async (url: string): Promise<ProfileDashboardResponse> => {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    let message = 'Unable to load profile dashboard'
    try {
      const body = (await response.json()) as { error?: unknown }
      if (typeof body.error === 'string' && body.error) message = body.error
    } catch {
      // Preserve the stable fallback message for non-JSON error responses.
    }
    throw new Error(message)
  }
  return (await response.json()) as ProfileDashboardResponse
}

const ProfilePage: NextPageWithLayout<ProfileProps> = ({
  userAddress,
  userName,
  ogImageURL,
}) => {
  const router = useRouter()
  const { address: connectedAddress } = useAccount()
  const { ensName, ensAvatar } = useEnsData(userAddress)
  const { data: profileIdentity, mutate: mutateProfileIdentity } = useProfileIdentity(
    ensName && !isAddress(ensName, { strict: false }) ? ensName : undefined,
    userAddress as AddressType
  )
  const {
    daos,
    error: daosError,
    isLoading: isLoadingDaos,
  } = useUserDaos({
    address: userAddress,
  })
  const {
    data: summaryDashboard,
    error: summaryDashboardError,
    isLoading: isLoadingSummaryDashboard,
  } = useSWR<ProfileDashboardResponse>(
    `/api/profile-dashboard?address=${userAddress}&mode=summary`,
    dashboardFetcher,
    { revalidateOnFocus: false }
  )
  const [shouldLoadTokens, setShouldLoadTokens] = React.useState(false)
  const {
    data: tokenDashboard,
    error: tokenDashboardError,
    isLoading: isLoadingTokenDashboard,
    mutate: mutateTokenDashboard,
  } = useSWR<ProfileDashboardResponse>(
    shouldLoadTokens ? `/api/profile-dashboard?address=${userAddress}&mode=tokens` : null,
    dashboardFetcher,
    { revalidateOnFocus: false }
  )

  const selectedDaoKeys = React.useMemo(
    () => parseDaoKeys(router.query.daoFilters),
    [router.query.daoFilters]
  )
  const validTokenSortValues = React.useMemo(
    () => new Set(TOKEN_SORT_OPTIONS.map((option) => option.value)),
    []
  )
  const tokenSort = validTokenSortValues.has(router.query.tokenSort as TokenSortOption)
    ? (router.query.tokenSort as TokenSortOption)
    : 'newest'

  const profileLink = `https://nouns.build/profile/${userAddress}`
  const isOwnProfile = isOwnProfileAddress(connectedAddress, userAddress)

  const updateQuery = React.useCallback(
    async (updates: Record<string, string | undefined>) => {
      const nextQuery = { ...router.query }
      Object.entries(updates).forEach(([key, value]) => {
        if (value) nextQuery[key] = value
        else delete nextQuery[key]
      })
      delete nextQuery.tab
      delete nextQuery.page
      delete nextQuery.activityDao
      delete nextQuery.activityChainId
      delete nextQuery.activityType
      delete nextQuery.tokenDao
      delete nextQuery.hiddenTokenDaos
      await router.push({ pathname: router.pathname, query: nextQuery }, undefined, {
        shallow: true,
        scroll: false,
      })
    },
    [router]
  )

  const setDaoKeys = React.useCallback(
    (keys: string[]) =>
      updateQuery({ daoFilters: keys.length ? keys.join(',') : undefined }),
    [updateQuery]
  )

  const dashboardData = React.useMemo(() => {
    const tokens: ProfileToken[] = []
    const auctionWins: FeedItem[] = []
    const summaryFailedChainNames: string[] = []
    const summaryTruncatedChainNames: string[] = []
    const tokenFailedChainNames: string[] = []
    const tokenTruncatedChainNames: string[] = []
    let tokenHoldings = 0
    let proposalVotes = 0
    let proposalsSubmitted = 0
    let bidsPlaced = 0
    let isSummaryComplete = !!summaryDashboard
    let isTokensComplete = !!tokenDashboard

    summaryDashboard?.chains.forEach((chain) => {
      if (!chain.result) {
        summaryFailedChainNames.push(chain.chainName)
        isSummaryComplete = false
        return
      }
      if (!chain.result.isComplete) {
        summaryTruncatedChainNames.push(chain.chainName)
        isSummaryComplete = false
      }
      auctionWins.push(...chain.result.auctionWins)
      tokenHoldings += chain.result.counts.tokenHoldings ?? chain.result.tokens.length
      proposalVotes += chain.result.counts.proposalVotes
      proposalsSubmitted += chain.result.counts.proposalsSubmitted
      bidsPlaced += chain.result.counts.bidsPlaced
    })

    tokenDashboard?.chains.forEach((chain) => {
      if (!chain.result) {
        tokenFailedChainNames.push(chain.chainName)
        isTokensComplete = false
        return
      }
      if (!chain.result.isComplete) {
        tokenTruncatedChainNames.push(chain.chainName)
        isTokensComplete = false
      }
      tokens.push(
        ...chain.result.tokens.map((token) => ({
          chainId: chain.chainId,
          chainSlug: chain.chainSlug,
          chainName: chain.chainName,
          tokenId: token.tokenId,
          tokenContract: token.tokenContract,
          name: token.name,
          image: token.image,
          mintedAt: token.mintedAt,
          daoName: token.dao.name,
          daoSymbol: token.dao.symbol,
          daoImage: token.dao.contractImage,
        }))
      )
    })

    if (summaryDashboardError) {
      isSummaryComplete = false
      if (!summaryFailedChainNames.length)
        summaryFailedChainNames.push('All supported chains')
    }
    if (tokenDashboardError) {
      isTokensComplete = false
      if (!tokenFailedChainNames.length)
        tokenFailedChainNames.push('All supported chains')
    }

    return {
      tokens: dedupeProfileTokens(tokens),
      auctionWins,
      summaryFailedChainNames: Array.from(new Set(summaryFailedChainNames)),
      summaryTruncatedChainNames: Array.from(new Set(summaryTruncatedChainNames)),
      tokenFailedChainNames: Array.from(new Set(tokenFailedChainNames)),
      tokenTruncatedChainNames: Array.from(new Set(tokenTruncatedChainNames)),
      counts: { tokenHoldings, proposalVotes, proposalsSubmitted, bidsPlaced },
      isSummaryComplete,
      isTokensComplete,
    }
  }, [summaryDashboard, summaryDashboardError, tokenDashboard, tokenDashboardError])

  const daoCount = new Set(
    daos?.map((dao) => createDaoKey(dao.chainId, dao.collectionAddress)) ?? []
  ).size
  const displayName = ensName || userName
  const pageTitle = `${displayName}'s Profile`
  const isDashboardPending = isLoadingSummaryDashboard && !summaryDashboard
  const stats: Array<{ label: string; value: number | string; isPartial?: boolean }> = [
    {
      label: 'DAOs',
      value: daosError || (isLoadingDaos && !daos.length) ? '—' : daoCount,
      isPartial: !!daosError,
    },
    {
      label: 'TOKENS',
      value:
        shouldLoadTokens && dashboardData.isTokensComplete && dashboardData.tokens.length
          ? dashboardData.tokens.length
          : dashboardData.isSummaryComplete
            ? dashboardData.counts.tokenHoldings
            : '—',
      isPartial: !isDashboardPending && !dashboardData.isSummaryComplete,
    },
    {
      label: 'VOTES',
      value: dashboardData.isSummaryComplete ? dashboardData.counts.proposalVotes : '—',
      isPartial: !isDashboardPending && !dashboardData.isSummaryComplete,
    },
    {
      label: 'PROPOSALS',
      value: dashboardData.isSummaryComplete
        ? dashboardData.counts.proposalsSubmitted
        : '—',
      isPartial: !isDashboardPending && !dashboardData.isSummaryComplete,
    },
    {
      label: 'BIDS',
      value: dashboardData.isSummaryComplete ? dashboardData.counts.bidsPlaced : '—',
      isPartial: !isDashboardPending && !dashboardData.isSummaryComplete,
    },
  ]
  return (
    <>
      <Meta
        title={pageTitle}
        type={`${displayName}:profile`}
        path={`/profile/${userAddress}`}
        description={`View ${displayName}'s profile, governance activity, and DAO tokens on Nouns Builder`}
        image={ogImageURL}
      />
      <main className={profilePage}>
        <section
          className={[profileSurface, profileHeaderSurface].join(' ')}
          aria-labelledby="profile-heading"
        >
          <div className={profileHeaderMain}>
            <div className={profileHeaderIdentity}>
              <Avatar address={userAddress} src={ensAvatar} size="80" />
              <Flex direction="column" className={profileHeaderIdentityContent}>
                <div className={profileHeaderNameRow}>
                  <Text
                    as="h1"
                    id="profile-heading"
                    variant="heading-md"
                    className={profileHeaderDisplayName}
                  >
                    {displayName}
                  </Text>
                  <div className={profileHeaderCopyRow}>
                    <span className={profileWalletAddress} title={userAddress}>
                      {walletSnippet(userAddress)}
                    </span>
                    <ProfileWalletScannerMenu
                      address={userAddress as AddressType}
                      profileLink={profileLink}
                      profileAddress={userAddress as AddressType}
                      profileName={displayName}
                      identity={profileIdentity}
                      onIdentitySaved={() => mutateProfileIdentity()}
                    />
                  </div>
                </div>
                <ProfileIdentityFields identity={profileIdentity} />
              </Flex>
            </div>
            <div className={profileHeaderRight}>
              <div className={profileHeaderTopRow}>
                <div className={profileStats} aria-label="Profile statistics">
                  {stats.map((stat) => (
                    <div key={stat.label} className={profileStat}>
                      <span className={profileStatValue}>{stat.value}</span>
                      <Text className={profileStatLabel}>{stat.label}</Text>
                      {stat.isPartial ? (
                        <Text color="text3" fontSize="12">
                          Unavailable
                        </Text>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={profileDashboardGrid}>
          <ProfileActivityPanel
            profileAddress={userAddress as AddressType}
            selectedDaoKeys={selectedDaoKeys}
            extraItems={dashboardData.auctionWins}
            failedChainNames={dashboardData.summaryFailedChainNames}
            truncatedChainNames={dashboardData.summaryTruncatedChainNames}
          />
          <ProfileDaoSelector
            daos={daos}
            isLoading={isLoadingDaos}
            profileAddress={userAddress}
            selectedKeys={selectedDaoKeys}
            onToggle={(daoKey) => setDaoKeys(toggleDaoSelection(selectedDaoKeys, daoKey))}
            onClear={() => setDaoKeys([])}
          />
        </div>

        <ProfileTokenGallery
          tokens={dashboardData.tokens}
          isLoading={shouldLoadTokens && isLoadingTokenDashboard}
          selectedDaoKeys={selectedDaoKeys}
          sort={tokenSort}
          onSortChange={(sort) =>
            updateQuery({ tokenSort: sort === 'newest' ? undefined : sort })
          }
          failedChainNames={dashboardData.tokenFailedChainNames}
          truncatedChainNames={dashboardData.tokenTruncatedChainNames}
          onRetry={() => mutateTokenDashboard()}
          onExpand={() => setShouldLoadTokens(true)}
          canTransferTokens={isOwnProfile}
          profileAddress={userAddress as AddressType}
          onTransferComplete={() => mutateTokenDashboard()}
        />
      </main>
    </>
  )
}

ProfilePage.getLayout = getProfileLayout

export default ProfilePage

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const user = params?.user as string
  const { maxAge, swr } = CACHE_TIMES.PROFILE
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  const userAddress = isAddress(user) ? user : await getEnsAddress(user)
  if (!userAddress) return { notFound: true }

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
  const data = {
    daos: (sortedDaos?.slice(0, 3) ?? []).map((dao) => ({
      collectionAddress: dao.collectionAddress,
      name: dao.name,
      contractImage: dao.contractImage,
    })),
  }
  const ogImageURL = `${BASE_URL}/api/og/profile?address=${userAddress}&data=${encodeURIComponent(JSON.stringify(data))}`
  const fallback = {
    [unstable_serialize([SWR_KEYS.MY_DAOS, userAddress.toLowerCase()])]: sortedDaos,
  }

  return { props: { userAddress, userName, ogImageURL, fallback } }
}
