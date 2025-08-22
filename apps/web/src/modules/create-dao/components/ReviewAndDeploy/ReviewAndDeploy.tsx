import { NULL_ADDRESS, PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants/addresses'
import { L2_CHAINS } from '@buildeross/constants/chains'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { managerAbi, managerV1Abi } from '@buildeross/sdk/contract'
import type { AddressType } from '@buildeross/types'
import { defaultBackButton } from '@buildeross/ui/styles'
import { formatDuration } from '@buildeross/utils/formatDuration'
import { toSeconds } from '@buildeross/utils/helpers'
import { sanitizeStringForJSON } from '@buildeross/utils/sanitize'
import { atoms, Box, Flex, Icon } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'
import { ContractButton } from 'src/components/ContractButton'
import { FallbackImage } from 'src/components/FallbackImage'
import { NetworkController } from 'src/components/NetworkController'
import { formatFounderAllocation } from 'src/modules/create-dao'
import { useChainStore } from 'src/stores/useChainStore'
import {
  deployCheckboxHelperText,
  deployCheckboxStyleVariants,
  deployCheckboxWrapperStyle,
  deployContractButtonStyle,
} from 'src/styles/deploy.css'
import {
  decodeEventLog,
  encodeAbiParameters,
  getAddress,
  parseAbiParameters,
  parseEther,
} from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { useFormStore } from '../../stores'
import { PreviewArtwork } from './PreviewArtwork'
import { ReviewItem } from './ReviewItem'
import { ReviewSection } from './ReviewSection'
import { SuccessfulDeploy } from './SuccessfulDeploy'

interface ReviewAndDeploy {
  title: string
}

const FAST_DAO_TIMINGS = {
  AUCTION_DURATION: { minutes: 5 },
  TIMELOCK_DELAY: { minutes: 5 },
  VOTING_DELAY: { minutes: 5 },
  VOTING_PERIOD: { minutes: 10 },
} as const

const DEFAULT_TIMELOCK_DELAY = { days: 2 }

const DEPLOYMENT_ERROR = {
  MISSING_IPFS_ARTWORK: `Oops! It looks like your artwork wasn't correctly uploaded to ipfs. Please go back to the artwork step to re-upload your artwork before proceeding.`,
  MISMATCHING_SIGNER:
    'Oops! It looks like the founder address submitted is different than the current signer address. Please go back to the allocation step and re-submit the founder address.',
  NO_FOUNDER:
    'Oops! It looks like you have no founders set. Please go back to the allocation step and add at least one founder address.',
  GENERIC:
    'Oops! Looks like there was a problem handling the dao deployment. Please ensure that input data from all the previous steps is correct',
  INVALID_ALLOCATION_PERCENTAGE:
    'Oops! Looks like there are undefined founder allocation values. Please go back to the allocation step to ensure that valid allocation values are set.',
}

export const ReviewAndDeploy: React.FC<ReviewAndDeploy> = ({ title }) => {
  const [enableFastDAO, setEnableFastDAO] = useState<boolean>(false)
  const [isPendingTransaction, setIsPendingTransaction] = useState<boolean>(false)
  const [hasConfirmedTerms, setHasConfirmedTerms] = useState<boolean>(false)
  const [hasConfirmedChain, setHasConfirmedChain] = useState<boolean>(false)
  const [hasConfirmedRewards, setHasConfirmedRewards] = useState<boolean>(false)
  const [deploymentError, setDeploymentError] = useState<string | undefined>()
  const chain = useChainStore((x) => x.chain)
  const isL2 = L2_CHAINS.includes(chain.id)
  const { data: version, isLoading: isVersionLoading } = useReadContract({
    abi: managerAbi,
    address: PUBLIC_MANAGER_ADDRESS[chain.id],
    functionName: 'contractVersion',
    chainId: chain.id,
  })
  const { address } = useAccount()
  const config = useConfig()

  const {
    founderAllocation,
    contributionAllocation,
    general,
    auctionSettings,
    setUpArtwork,
    setActiveSection,
    activeSection,
    fulfilledSections,
    deployedDao,
    setDeployedDao,
    ipfsUpload,
    setFulfilledSections,
    vetoPower,
    vetoerAddress,
  } = useFormStore()

  const handlePrev = useCallback(() => {
    setActiveSection(activeSection - 1)
  }, [setActiveSection, activeSection])

  const founderParams = useMemo(
    () =>
      [...founderAllocation, ...contributionAllocation].map(
        ({ founderAddress, allocationPercentage: allocation, endDate }) => ({
          wallet: founderAddress as AddressType,
          ownershipPct: allocation ? BigInt(allocation) : BigInt(0),
          vestExpiry: BigInt(Math.floor(new Date(endDate).getTime() / 1000)),
        })
      ),
    [founderAllocation, contributionAllocation]
  )

  const tokenParamsHex = useMemo(
    () =>
      encodeAbiParameters(
        parseAbiParameters(
          'string name, string symbol, string description, string daoImage, string daoWebsite, string baseRenderer'
        ),
        [
          sanitizeStringForJSON(general?.daoName),
          general?.daoSymbol.replace('$', ''),
          sanitizeStringForJSON(setUpArtwork?.projectDescription),
          general?.daoAvatar || '',
          sanitizeStringForJSON(general?.daoWebsite || ''),
          RENDERER_BASE,
        ]
      ),
    [
      general?.daoName,
      general?.daoSymbol,
      general?.daoAvatar,
      general?.daoWebsite,
      setUpArtwork?.projectDescription,
    ]
  )

  const tokenParams = useMemo(
    () => ({ initStrings: tokenParamsHex as AddressType }),
    [tokenParamsHex]
  )

  const auctionParams = useMemo(
    () => ({
      reservePrice:
        auctionSettings.auctionReservePrice && !enableFastDAO
          ? parseEther(auctionSettings.auctionReservePrice.toString())
          : parseEther('0'),
      duration: enableFastDAO
        ? BigInt(toSeconds(FAST_DAO_TIMINGS.AUCTION_DURATION))
        : auctionSettings?.auctionDuration
          ? BigInt(toSeconds(auctionSettings?.auctionDuration))
          : BigInt('86400'),
      founderRewardRecipent: NULL_ADDRESS,
      founderRewardBps: 0,
    }),
    [
      auctionSettings?.auctionDuration,
      auctionSettings?.auctionReservePrice,
      enableFastDAO,
    ]
  )

  const govParams = useMemo(
    () => ({
      timelockDelay: enableFastDAO
        ? BigInt(toSeconds(FAST_DAO_TIMINGS.TIMELOCK_DELAY))
        : BigInt(toSeconds(DEFAULT_TIMELOCK_DELAY)),
      votingDelay: enableFastDAO
        ? BigInt(toSeconds(FAST_DAO_TIMINGS.VOTING_DELAY))
        : BigInt(toSeconds(auctionSettings.votingDelay)),
      votingPeriod: enableFastDAO
        ? BigInt(toSeconds(FAST_DAO_TIMINGS.VOTING_PERIOD))
        : BigInt(toSeconds(auctionSettings.votingPeriod)),
      proposalThresholdBps: auctionSettings?.proposalThreshold
        ? BigInt(Number((Number(auctionSettings?.proposalThreshold) * 100).toFixed(2)))
        : BigInt('0'),
      quorumThresholdBps: auctionSettings?.quorumThreshold
        ? BigInt(Number((Number(auctionSettings?.quorumThreshold) * 100).toFixed(2)))
        : BigInt('0'),
      vetoer:
        vetoPower === true
          ? getAddress(vetoerAddress as AddressType)
          : getAddress(NULL_ADDRESS),
    }),
    [
      auctionSettings?.votingPeriod,
      auctionSettings?.votingDelay,
      auctionSettings?.proposalThreshold,
      auctionSettings?.quorumThreshold,
      vetoPower,
      vetoerAddress,
      enableFastDAO,
    ]
  )

  const handleDeploy = useCallback(async () => {
    setDeploymentError(undefined)

    if (
      [...founderAllocation, ...contributionAllocation].find(
        (founder) => typeof founder.allocationPercentage === 'undefined'
      )
    ) {
      setDeploymentError(DEPLOYMENT_ERROR.INVALID_ALLOCATION_PERCENTAGE)
      return
    }

    if (founderParams.length === 0) {
      setDeploymentError(DEPLOYMENT_ERROR.NO_FOUNDER)
      return
    }

    if (!address || getAddress(founderParams[0].wallet) !== getAddress(address)) {
      setDeploymentError(DEPLOYMENT_ERROR.MISMATCHING_SIGNER)
      return
    }

    if (ipfsUpload.length === 0) {
      setDeploymentError(DEPLOYMENT_ERROR.MISSING_IPFS_ARTWORK)
      return
    }

    setIsPendingTransaction(true)
    let transaction
    try {
      let txHash: `0x${string}`
      if (version?.startsWith('2')) {
        const data = await simulateContract(config, {
          address: PUBLIC_MANAGER_ADDRESS[chain.id],
          chainId: chain.id,
          abi: managerAbi,
          functionName: 'deploy',
          args: [
            founderParams,
            { ...tokenParams, reservedUntilTokenId: 0n, metadataRenderer: NULL_ADDRESS },
            {
              ...auctionParams,
              founderRewardRecipent: NULL_ADDRESS,
              founderRewardBps: 0,
            },
            govParams,
          ],
        })
        txHash = await writeContract(config, data.request)
      } else {
        const data = await simulateContract(config, {
          address: PUBLIC_MANAGER_ADDRESS[chain.id],
          chainId: chain.id,
          abi: managerV1Abi,
          functionName: 'deploy',
          args: [founderParams, tokenParams, auctionParams, govParams],
        })
        txHash = await writeContract(config, data.request)
      }

      if (txHash)
        transaction = await waitForTransactionReceipt(config, {
          hash: txHash,
          chainId: chain.id,
        })
    } catch (e) {
      console.error('Error deploying DAO:', e)
      setIsPendingTransaction(false)
      return
    }

    //keccak256 hashed value of DAODeployed(address,address,address,address,address)
    const deployEvent = transaction?.logs.find(
      (log) =>
        log?.topics[0]?.toLowerCase() ===
        '0x456d2baf5a87d70e586ec06fb91c2d7849778dd41d80fa826a6ea5bf8d28e3a6'
    )

    let parsedEvent
    try {
      parsedEvent = decodeEventLog({
        abi: managerAbi,
        eventName: 'DAODeployed',
        topics: deployEvent?.topics || [],
        data: deployEvent?.data || '0x',
      })
    } catch {}

    const deployedAddresses = parsedEvent?.args

    if (!deployedAddresses) {
      setDeploymentError(DEPLOYMENT_ERROR.GENERIC)
      setIsPendingTransaction(false)
      return
    }

    setDeployedDao(deployedAddresses)
    setIsPendingTransaction(false)
    setFulfilledSections(title)
  }, [
    founderAllocation,
    contributionAllocation,
    address,
    founderParams,
    ipfsUpload.length,
    config,
    chain.id,
    version,
    tokenParams,
    auctionParams,
    govParams,
    setDeployedDao,
    setFulfilledSections,
    title,
  ])

  const isDisabled = useMemo(
    () =>
      !address ||
      !hasConfirmedTerms ||
      !hasConfirmedChain ||
      (isL2 && !hasConfirmedRewards) ||
      isPendingTransaction ||
      isVersionLoading,
    [
      address,
      hasConfirmedTerms,
      hasConfirmedChain,
      isL2,
      hasConfirmedRewards,
      isPendingTransaction,
      isVersionLoading,
    ]
  )

  return (
    <Box>
      {!fulfilledSections.includes(title) ? (
        <Box>
          <Flex direction={'column'}>
            <ReviewSection subHeading="General Info">
              <ReviewItem
                label="Dao Avatar"
                value={
                  <FallbackImage
                    className={atoms({
                      mt: 'x4',
                      height: 'x24',
                      width: 'x24',
                      borderRadius: 'round',
                    })}
                    srcList={getFetchableUrls(general.daoAvatar)}
                    alt=""
                  />
                }
              />
              <ReviewItem label="Dao Name" value={general.daoName} />
              <ReviewItem label="Dao Symbol" value={general.daoSymbol} />
              <ReviewItem label="Dao Website" value={general.daoWebsite} />
            </ReviewSection>

            <ReviewSection subHeading="Auction Settings">
              <ReviewItem
                label="Auction Duration"
                value={
                  enableFastDAO
                    ? formatDuration(FAST_DAO_TIMINGS.AUCTION_DURATION)
                    : formatDuration(auctionSettings.auctionDuration)
                }
              />
              <ReviewItem
                label="Auction Reserve Price"
                value={
                  enableFastDAO ? '0 ETH' : `${auctionSettings.auctionReservePrice} ETH`
                }
              />
              <ReviewItem
                label="Proposal Threshold"
                value={`${auctionSettings.proposalThreshold} %`}
              />
              <ReviewItem
                label="Quorum Threshold"
                value={`${auctionSettings.quorumThreshold} %`}
              />
            </ReviewSection>

            <ReviewSection subHeading="Governance Settings">
              <ReviewItem
                label="Voting Delay"
                value={
                  enableFastDAO
                    ? formatDuration(FAST_DAO_TIMINGS.VOTING_DELAY)
                    : formatDuration(auctionSettings.votingDelay)
                }
              />
              <ReviewItem
                label="Voting Period"
                value={
                  enableFastDAO
                    ? formatDuration(FAST_DAO_TIMINGS.VOTING_PERIOD)
                    : formatDuration(auctionSettings.votingPeriod)
                }
              />
              <ReviewItem
                label="Timelock Delay"
                value={
                  enableFastDAO
                    ? formatDuration(FAST_DAO_TIMINGS.TIMELOCK_DELAY)
                    : formatDuration(DEFAULT_TIMELOCK_DELAY)
                }
              />
            </ReviewSection>

            <ReviewSection subHeading="Allocation">
              {[...founderAllocation, ...contributionAllocation].map((value, i) => (
                <ReviewItem
                  label="Founder Allocation"
                  value={formatFounderAllocation(value)}
                  key={i}
                />
              ))}
            </ReviewSection>

            <ReviewSection subHeading="Set Up Artwork">
              <ReviewItem
                label="Project Description"
                value={setUpArtwork.projectDescription}
              />
              <ReviewItem label="Artwork" value={<PreviewArtwork />} />
              <ReviewItem label="Files Length" value={setUpArtwork.filesLength} />
            </ReviewSection>
          </Flex>
          <Flex direction={'column'} p={'x6'} className={deployCheckboxWrapperStyle}>
            <Flex>
              <Flex align={'center'} justify={'center'} gap={'x4'}>
                <Flex
                  align={'center'}
                  justify={'center'}
                  className={
                    deployCheckboxStyleVariants[
                      hasConfirmedTerms ? 'confirmed' : 'default'
                    ]
                  }
                  onClick={() => setHasConfirmedTerms((bool) => !bool)}
                >
                  {hasConfirmedTerms && <Icon fill="background1" id="check" />}
                </Flex>

                <Flex className={deployCheckboxHelperText}>
                  [I have reviewed and acknowledge and agree to the{' '}
                  <a
                    href={'/legal'}
                    target="_blank"
                    className={atoms({ color: 'accent' })}
                    rel="noreferrer"
                  >
                    Nouns Builder Terms of Service
                  </a>
                  ]
                </Flex>
              </Flex>
            </Flex>

            <Flex mt="x4">
              <Flex align={'center'} justify={'center'} gap={'x4'}>
                <Flex
                  align={'center'}
                  justify={'center'}
                  className={
                    deployCheckboxStyleVariants[
                      hasConfirmedChain ? 'confirmed' : 'default'
                    ]
                  }
                  onClick={() => setHasConfirmedChain((bool) => !bool)}
                >
                  {hasConfirmedChain && <Icon fill="background1" id="check" />}
                </Flex>

                <Flex className={deployCheckboxHelperText}>
                  I am deploying my DAO on <strong>{chain.name}</strong>
                </Flex>
              </Flex>
            </Flex>

            {isL2 && (
              <Flex mt="x4">
                <Flex align={'center'} justify={'center'} gap={'x4'}>
                  <Flex
                    align={'center'}
                    justify={'center'}
                    className={
                      deployCheckboxStyleVariants[
                        hasConfirmedRewards ? 'confirmed' : 'default'
                      ]
                    }
                    onClick={() => setHasConfirmedRewards((bool) => !bool)}
                  >
                    {hasConfirmedRewards && <Icon fill="background1" id="check" />}
                  </Flex>

                  <Flex className={deployCheckboxHelperText}>
                    I have read the{' '}
                    <a
                      href={'https://docs.nouns.build/guides/builder-protocol-rewards/'}
                      target="_blank"
                      className={atoms({ color: 'accent' })}
                      rel="noreferrer"
                    >
                      Builder Protocol Rewards documentation
                    </a>{' '}
                    and understand how Protocol Rewards apply to this DAO.
                  </Flex>
                </Flex>
              </Flex>
            )}

            <NetworkController.Testnet>
              <Flex mt="x4">
                <Flex align={'center'} justify={'center'} gap={'x4'}>
                  <Flex
                    align={'center'}
                    justify={'center'}
                    className={
                      deployCheckboxStyleVariants[enableFastDAO ? 'confirmed' : 'default']
                    }
                    onClick={() => setEnableFastDAO((bool) => !bool)}
                  >
                    {enableFastDAO && <Icon fill="background1" id="check" />}
                  </Flex>

                  <Flex className={deployCheckboxHelperText}>
                    <strong>Enable Fast DAO (testnet only):</strong> ultra-short timings
                    for testing - {formatDuration(FAST_DAO_TIMINGS.AUCTION_DURATION)}{' '}
                    auction (0 ETH reserve),{' '}
                    {formatDuration(FAST_DAO_TIMINGS.TIMELOCK_DELAY)} timelock,{' '}
                    {formatDuration(FAST_DAO_TIMINGS.VOTING_DELAY)} voting delay,{' '}
                    {formatDuration(FAST_DAO_TIMINGS.VOTING_PERIOD)} voting period.{' '}
                    <strong>Not for production.</strong>
                  </Flex>
                </Flex>
              </Flex>
            </NetworkController.Testnet>

            {deploymentError && (
              <Flex mt={'x4'} color="negative">
                {deploymentError}
              </Flex>
            )}

            <Flex mt={'x8'}>
              <Flex
                justify={'center'}
                align={'center'}
                w={'x15'}
                h={'x15'}
                minH={'x15'}
                minW={'x15'}
                onClick={() => handlePrev()}
                className={defaultBackButton}
              >
                <Icon id="arrowLeft" />
              </Flex>
              <ContractButton
                handleClick={handleDeploy}
                w={'100%'}
                disabled={isDisabled}
                className={
                  deployContractButtonStyle[isPendingTransaction ? 'pending' : 'default']
                }
              >
                {`${isPendingTransaction ? 'Deploying' : 'Deploy'} Contracts (1 of 2)`}
              </ContractButton>
            </Flex>
          </Flex>
        </Box>
      ) : (
        <SuccessfulDeploy
          token={deployedDao?.token}
          metadata={deployedDao?.metadata}
          auction={deployedDao?.auction}
          treasury={deployedDao?.treasury}
          governor={deployedDao?.governor}
          title={title}
        />
      )}
    </Box>
  )
}
