import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { AirdropInstanceData } from '@buildeross/hooks/useAirdropData'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { type CHAIN_ID, TokenMetadata } from '@buildeross/types'
import { AccordionItem } from '@buildeross/ui/Accordion'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Icon, Stack, Text } from '@buildeross/zord'
import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  Address,
  formatUnits,
  getAddress,
  type Hex,
  isAddressEqual,
  parseAbi,
} from 'viem'
import { useAccount, useConfig, useReadContracts } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

interface AirdropItemProps {
  airdrop: AirdropInstanceData
  index: number
  isExecuted: boolean
  chainId: CHAIN_ID
  tokenMetadata?: TokenMetadata
  currentBalance?: bigint
}

const merkleCampaignAbi = parseAbi([
  'function hasClaimed(uint256 index) view returns (bool)',
  'function calculateMinFeeWei() view returns (uint256)',
  'function claim(uint256 index, address recipient, uint128 amount, bytes32[] merkleProof) payable',
])

type EligibleLeaf = {
  index: bigint
  amount: bigint
  recipient: Address
  proof: Hex[]
}

async function fetchJsonFromCid(cid: string): Promise<any> {
  const urls = getFetchableUrls(`ipfs://${cid}`)

  if (!urls?.length) {
    throw new Error('Could not resolve IPFS gateway URL for campaign metadata')
  }

  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (!response.ok) continue
      return await response.json()
    } catch {
      continue
    }
  }

  throw new Error('Failed to fetch campaign metadata from IPFS gateways')
}

const toDateString = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleDateString('en-US')

const formatDurationDays = (durationInSeconds?: number): string => {
  if (!durationInSeconds || durationInSeconds <= 0) return '0 days'
  const days = durationInSeconds / (24 * 60 * 60)
  return `${days % 1 === 0 ? days.toFixed(0) : days.toFixed(2)} days`
}

export const AirdropItem = ({
  airdrop,
  index,
  isExecuted,
  chainId,
  tokenMetadata,
  currentBalance,
}: AirdropItemProps) => {
  const { address } = useAccount()
  const config = useConfig()
  const [isClaiming, setIsClaiming] = useState(false)

  const decimals = tokenMetadata?.decimals ?? 18
  const symbol = tokenMetadata?.symbol

  const amountDisplay = symbol
    ? `${formatCryptoVal(formatUnits(airdrop.aggregateAmount, decimals))} ${symbol}`
    : formatUnits(airdrop.aggregateAmount, decimals)

  const title = (
    <Text>
      Airdrop {index + 1}: {amountDisplay} - {airdrop.recipientCount.toString()}{' '}
      recipients
    </Text>
  )

  const ipfsHref = airdrop.ipfsCID ? `https://ipfs.io/ipfs/${airdrop.ipfsCID}` : ''
  const sablierCampaignHref = airdrop.campaignAddress
    ? `https://app.sablier.com/airdrops/campaign/${airdrop.campaignAddress}-${chainId}`
    : ''

  const {
    data: ipfsData,
    isLoading: isLoadingIpfs,
    error: ipfsError,
  } = useSWR(
    isExecuted && !!airdrop.ipfsCID && !!address
      ? (['sablier-airdrop-ipfs', airdrop.ipfsCID, address] as const)
      : null,
    async ([, cid]) => {
      const json = await fetchJsonFromCid(cid)
      const rawTree = json?.merkle_tree

      if (!rawTree) {
        throw new Error('Merkle tree not found in IPFS payload')
      }

      const { StandardMerkleTree } = await import('@openzeppelin/merkle-tree')
      const dump = typeof rawTree === 'string' ? JSON.parse(rawTree) : rawTree
      const tree = StandardMerkleTree.load(dump)

      return {
        tree,
        root: tree.root as Hex,
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const eligibleLeaf = useMemo<EligibleLeaf | null>(() => {
    if (!ipfsData?.tree || !address) return null

    const normalized = getAddress(address)

    for (const [, value] of ipfsData.tree.entries()) {
      const tuple = value as [string, string, string]
      const recipient = getAddress(tuple[1])
      if (!isAddressEqual(recipient, normalized)) continue

      const proof = ipfsData.tree.getProof(value) as Hex[]
      return {
        index: BigInt(tuple[0]),
        amount: BigInt(tuple[2]),
        recipient,
        proof,
      }
    }

    return null
  }, [ipfsData, address])

  const readContracts = useMemo(
    () =>
      isExecuted && airdrop.campaignAddress && eligibleLeaf
        ? [
            {
              address: airdrop.campaignAddress,
              abi: merkleCampaignAbi,
              functionName: 'hasClaimed' as const,
              args: [eligibleLeaf.index],
              chainId,
            },
            {
              address: airdrop.campaignAddress,
              abi: merkleCampaignAbi,
              functionName: 'calculateMinFeeWei' as const,
              args: [],
              chainId,
            },
          ]
        : [],
    [isExecuted, airdrop.campaignAddress, eligibleLeaf, chainId]
  )

  const { data: claimReadResults, refetch: refetchClaimState } = useReadContracts({
    contracts: readContracts,
    allowFailure: true,
    query: {
      enabled: readContracts.length > 0,
      staleTime: 15_000,
      refetchOnWindowFocus: false,
    },
  })

  const hasClaimed =
    claimReadResults?.[0]?.status === 'success'
      ? Boolean(claimReadResults[0].result)
      : false

  const minFeeWei =
    claimReadResults?.[1]?.status === 'success'
      ? (claimReadResults[1].result as bigint)
      : 0n

  const now = Math.floor(Date.now() / 1000)
  const notStarted = airdrop.campaignStartTime > now
  const expired = airdrop.expiration > 0 && airdrop.expiration <= now
  const hasBalanceForClaim =
    currentBalance !== undefined && eligibleLeaf
      ? currentBalance >= eligibleLeaf.amount
      : false

  const isClaimable =
    !!eligibleLeaf && !hasClaimed && !notStarted && !expired && hasBalanceForClaim

  const handleClaim = useCallback(async () => {
    if (!airdrop.campaignAddress || !eligibleLeaf) return

    try {
      setIsClaiming(true)
      const simulation = await simulateContract(config, {
        address: airdrop.campaignAddress,
        abi: merkleCampaignAbi,
        functionName: 'claim',
        args: [
          eligibleLeaf.index,
          eligibleLeaf.recipient,
          eligibleLeaf.amount,
          eligibleLeaf.proof,
        ],
        value: minFeeWei,
      })

      const hash = await writeContract(config, simulation.request)
      await waitForTransactionReceipt(config, { hash, chainId })

      await refetchClaimState()
    } catch (error) {
      console.error('Failed to claim airdrop:', error)
    } finally {
      setIsClaiming(false)
    }
  }, [
    airdrop.campaignAddress,
    eligibleLeaf,
    config,
    minFeeWei,
    chainId,
    refetchClaimState,
  ])

  const campaignBalanceDisplay =
    currentBalance !== undefined
      ? symbol
        ? `${formatCryptoVal(formatUnits(currentBalance, decimals))} ${symbol}`
        : formatUnits(currentBalance, decimals)
      : null

  const fundingState =
    currentBalance === undefined
      ? null
      : currentBalance >= airdrop.aggregateAmount
        ? 'funded'
        : 'underfunded'

  const description = (
    <Stack gap="x3">
      <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
        <Stack direction="row" gap="x2" align="center" flexShrink={0}>
          <Text variant="label-sm" color="tertiary">
            Type:
          </Text>
          <Text variant="label-sm">{airdrop.type === 'instant' ? 'Instant' : 'LL'}</Text>
        </Stack>
        <Stack direction="row" gap="x2" align="center" flexShrink={0}>
          <Text variant="label-sm" color="tertiary">
            Token:
          </Text>
          <Text variant="label-sm">{symbol || walletSnippet(airdrop.token)}</Text>
        </Stack>
      </Stack>

      <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
        <Stack direction="row" gap="x2" align="center" flexShrink={0}>
          <Text variant="label-sm" color="tertiary">
            Campaign:
          </Text>
          <Text variant="label-sm">{airdrop.campaignName || 'Untitled Campaign'}</Text>
        </Stack>
        <Stack direction="row" gap="x2" align="center" flexShrink={0}>
          <Text variant="label-sm" color="tertiary">
            Admin:
          </Text>
          <Text variant="label-sm">{walletSnippet(airdrop.initialAdmin)}</Text>
        </Stack>
      </Stack>

      <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
        <Stack direction="row" gap="x2" align="center" flexShrink={0}>
          <Text variant="label-sm" color="tertiary">
            Start:
          </Text>
          <Text variant="label-sm">{toDateString(airdrop.campaignStartTime)}</Text>
        </Stack>
        <Stack direction="row" gap="x2" align="center" flexShrink={0}>
          <Text variant="label-sm" color="tertiary">
            Expiration:
          </Text>
          <Text variant="label-sm">
            {airdrop.expiration === 0
              ? 'No expiration'
              : toDateString(airdrop.expiration)}
          </Text>
        </Stack>
      </Stack>

      {airdrop.type === 'll' && (
        <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
          <Stack direction="row" gap="x2" align="center" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Vesting Start:
            </Text>
            <Text variant="label-sm">{toDateString(airdrop.vestingStartTime || 0)}</Text>
          </Stack>
          <Stack direction="row" gap="x2" align="center" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Total/Cliff:
            </Text>
            <Text variant="label-sm">
              {formatDurationDays(airdrop.totalDuration)} /{' '}
              {formatDurationDays(airdrop.cliffDuration)}
            </Text>
          </Stack>
        </Stack>
      )}

      {airdrop.type === 'll' && (
        <Stack direction="row" align="center" justify="space-between" wrap gap="x2">
          <Stack direction="row" gap="x2" align="center" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Cancelable:
            </Text>
            <Text variant="label-sm">{airdrop.cancelable ? 'Yes' : 'No'}</Text>
          </Stack>
          <Stack direction="row" gap="x2" align="center" flexShrink={0}>
            <Text variant="label-sm" color="tertiary">
              Transferable:
            </Text>
            <Text variant="label-sm">{airdrop.transferable ? 'Yes' : 'No'}</Text>
          </Stack>
        </Stack>
      )}

      <Stack direction="column" gap="x1">
        <Text variant="label-sm" color="tertiary">
          Merkle Root
        </Text>
        <Text variant="paragraph-sm" style={{ wordBreak: 'break-all' }}>
          {airdrop.merkleRoot}
        </Text>
      </Stack>

      <Stack direction="column" gap="x1">
        <Text variant="label-sm" color="tertiary">
          IPFS CID
        </Text>
        <a href={ipfsHref} target="_blank" rel="noreferrer">
          <Text variant="paragraph-sm" style={{ wordBreak: 'break-all' }}>
            {airdrop.ipfsCID}
          </Text>
        </a>
      </Stack>

      {isExecuted && campaignBalanceDisplay && (
        <Box
          p="x3"
          borderRadius="curved"
          backgroundColor="background2"
          borderWidth="normal"
          borderStyle="solid"
          borderColor={fundingState === 'underfunded' ? 'negative' : 'border'}
        >
          <Stack gap="x1">
            <Text variant="label-sm" color="tertiary">
              Campaign Balance
            </Text>
            <Text variant="paragraph-sm">
              {campaignBalanceDisplay} / {amountDisplay}
            </Text>
            {fundingState === 'underfunded' && (
              <Text variant="label-sm" color="negative">
                Campaign is not fully funded yet.
              </Text>
            )}
          </Stack>
        </Box>
      )}

      {isExecuted && (
        <Box
          p="x3"
          borderRadius="curved"
          backgroundColor="background2"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="border"
        >
          <Stack gap="x1">
            <Text variant="label-sm" color="tertiary">
              Eligibility
            </Text>

            {!address && (
              <Text variant="paragraph-sm">Connect wallet to check eligibility.</Text>
            )}

            {!!address && isLoadingIpfs && (
              <Text variant="paragraph-sm">Checking eligibility...</Text>
            )}

            {!!address && !!ipfsError && (
              <Text variant="paragraph-sm" color="negative">
                Failed to load eligibility data from IPFS.
              </Text>
            )}

            {!!address && !isLoadingIpfs && !ipfsError && !eligibleLeaf && (
              <Text variant="paragraph-sm">
                This wallet is not eligible for this campaign.
              </Text>
            )}

            {!!address && eligibleLeaf && (
              <Stack gap="x1">
                <Text variant="paragraph-sm" color="positive">
                  You are eligible for this airdrop.
                </Text>
                <Text variant="paragraph-sm">
                  Claim Amount:{' '}
                  {symbol
                    ? `${formatCryptoVal(formatUnits(eligibleLeaf.amount, decimals))} ${symbol}`
                    : formatUnits(eligibleLeaf.amount, decimals)}
                </Text>
                <Text variant="paragraph-sm">
                  Claim Index: {eligibleLeaf.index.toString()}
                </Text>
                <Text variant="paragraph-sm">
                  Claim Status:{' '}
                  {hasClaimed
                    ? 'Already claimed'
                    : isClaimable
                      ? 'Claimable now'
                      : notStarted
                        ? 'Campaign not started'
                        : expired
                          ? 'Campaign expired'
                          : !hasBalanceForClaim
                            ? 'Campaign underfunded'
                            : 'Not claimable right now'}
                </Text>
                {!hasClaimed && (
                  <Text variant="paragraph-sm">
                    Min Fee: {formatUnits(minFeeWei, 18)} ETH
                  </Text>
                )}

                {!hasClaimed && (
                  <ContractButton
                    chainId={chainId}
                    variant="primary"
                    handleClick={handleClaim}
                    loading={isClaiming}
                    disabled={!isClaimable || isClaiming}
                  >
                    Claim Airdrop
                  </ContractButton>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      {isExecuted && airdrop.campaignAddress && (
        <Stack direction="row" gap="x2" wrap>
          <a href={sablierCampaignHref} target="_blank" rel="noreferrer">
            <Button variant="primary" size="sm">
              Check Eligibility & Claim
              <Icon id="arrowTopRight" />
            </Button>
          </a>
          <a
            href={`${ETHERSCAN_BASE_URL[chainId]}/address/${airdrop.campaignAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="secondary" size="sm">
              View Campaign Contract
              <Icon id="arrowTopRight" />
            </Button>
          </a>
        </Stack>
      )}

      {!isExecuted && (
        <Box
          p="x3"
          borderRadius="curved"
          backgroundColor="background2"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="border"
        >
          <Text variant="label-sm" color="tertiary">
            Campaign will be created and funded when the proposal is executed
          </Text>
        </Box>
      )}
    </Stack>
  )

  return <AccordionItem title={title} description={description} />
}
