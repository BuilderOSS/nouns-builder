import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import SWR_KEYS from '@buildeross/constants/swrKeys'
import { useEnsData } from '@buildeross/hooks'
import { usePagination } from '@buildeross/hooks/usePagination'
import { myDaosRequest, tokensQuery } from '@buildeross/sdk/subgraph'
import { getEnsAddress, getEnsName } from '@buildeross/utils/ens'
import { chainIdToSlug, walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Avatar } from 'src/components/Avatar'
import CopyButton from 'src/components/CopyButton/CopyButton'
import { Meta } from 'src/components/Meta'
import Pagination from 'src/components/Pagination'
import { TokenPreview } from 'src/components/Profile'
import { getProfileLayout } from 'src/layouts/ProfileLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { artworkSkeleton } from 'src/styles/Artwork.css'
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
  const isMobile = useLayoutStore((x) => x.isMobile)
  const chain = useChainStore((x) => x.chain)
  const { query } = useRouter()

  const page = query.page as string

  const { ensName, ensAvatar } = useEnsData(userAddress)

  const { data: tokens, isValidating: isLoadingTokens } = useSWR(
    userAddress ? [SWR_KEYS.PROFILE_TOKENS, chain.slug, userAddress, page] : undefined,
    () => tokensQuery(chain.id, userAddress, page ? parseInt(page) : undefined)
  )

  const { data: daos, isValidating: isLoadingDaos } = useSWR(
    userAddress ? [SWR_KEYS.PROFILE_DAOS, userAddress.toLowerCase()] : undefined,
    () => myDaosRequest(userAddress)
  )

  const isLoading = isLoadingTokens || isLoadingDaos
  const hasDaos = !!daos && daos.length > 0

  const { handlePageBack, handlePageForward } = usePagination(tokens?.hasNextPage)

  const pageTitle = `${userName}'s Profile`
  const pageDescription = `View ${userName}'s profile and DAO tokens on Nouns Builder`
  const profilePath = `/profile/${userAddress}`

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
        position={isMobile ? 'relative' : 'fixed'}
        h={{ '@initial': 'unset', '@768': '100vh' }}
        top={'x0'}
        left={'x0'}
        justify={'space-around'}
        w="100%"
        px={{ '@initial': 'x0', '@768': 'x8' }}
      >
        <Flex
          w="100%"
          direction={{ '@initial': 'column', '@768': 'row' }}
          h={{ '@initial': 'unset', '@768': '100%' }}
          style={{ maxWidth: '1440px' }}
          position={'relative'}
        >
          <Box
            style={{ width: isMobile ? '100%' : '30%' }}
            mt={{ '@initial': 'x12', '@768': 'x32' }}
            pr={{ '@768': 'x18' }}
          >
            <Flex
              align={{ '@initial': 'center', '@768': 'flex-start' }}
              direction={{ '@initial': 'row', '@768': 'column' }}
            >
              <Avatar
                mr={{ '@initial': 'x2', '@768': undefined }}
                address={userAddress}
                src={ensAvatar}
                size={isMobile ? '40' : '90'}
              />
              <Text
                variant={isMobile ? 'heading-sm' : 'heading-md'}
                position={'relative'}
                mt={{ '@768': 'x4' }}
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

            <Flex mt="x8" align={'flex-start'}>
              <Text mr="x4" fontWeight={'display'}>
                DAOs
              </Text>
              {isLoadingDaos ? (
                <Box
                  backgroundColor="background2"
                  h="x6"
                  w="100%"
                  className={artworkSkeleton}
                  borderRadius="normal"
                />
              ) : daos && daos?.length > 0 ? (
                <Text color="text3">
                  {daos.map((dao, index) => (
                    <>
                      <Link
                        href={`https://nouns.build/dao/${chainIdToSlug(dao.chainId)}/${dao.collectionAddress}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        className="profile-dao-links"
                      >
                        {dao.name}
                      </Link>
                      {index < daos.length - 1 && ', '}
                    </>
                  ))}
                </Text>
              ) : (
                <Text>No DAO tokens owned.</Text>
              )}
            </Flex>
          </Box>
          {!isMobile && (
            <Box
              position={'absolute'}
              h="100vh"
              top="x0"
              style={{ left: '27%', borderRight: '2px solid #F2F2F2' }}
            />
          )}

          <Box
            mt={{ '@initial': 'x14', '@768': 'x32' }}
            style={{
              width: isMobile ? '100%' : '70%',
              maxHeight: isMobile ? undefined : '80vh',
              overflow: 'auto',
            }}
          >
            {isLoadingTokens && (
              <Grid columns={isMobile ? 1 : 3} gap={'x12'}>
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Box
                      key={i}
                      backgroundColor="background2"
                      width={'100%'}
                      height={'100%'}
                      aspectRatio={1 / 1}
                      position="relative"
                      className={artworkSkeleton}
                    />
                  ))}
              </Grid>
            )}

            {hasDaos && (
              <>
                {!!tokens?.tokens.length ? (
                  <Grid columns={isMobile ? 1 : 3} gap={'x12'}>
                    {tokens?.tokens.map((x, i) => (
                      <Link
                        key={i}
                        href={`/dao/${chain.slug}/${x.tokenContract}/${x.tokenId}`}
                      >
                        <TokenPreview name={x.name} image={x.image} />
                      </Link>
                    ))}
                  </Grid>
                ) : (
                  <Flex
                    align={'center'}
                    justify={'space-around'}
                    style={{ height: isMobile ? '40vh' : '65vh' }}
                  >
                    <Text color="text3">No more DAO tokens found.</Text>
                  </Flex>
                )}

                <Pagination
                  onNext={handlePageForward}
                  onPrev={handlePageBack}
                  isLast={!tokens?.hasNextPage}
                  isFirst={!page}
                />
              </>
            )}

            {!isLoading && !hasDaos && (
              <Flex
                align={'center'}
                justify={'space-around'}
                style={{ height: isMobile ? '40vh' : '65vh' }}
              >
                <Text color="text3">No DAO tokens owned.</Text>
              </Flex>
            )}
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
