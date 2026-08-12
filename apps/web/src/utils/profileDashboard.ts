import type { FeedItem } from '@buildeross/types'

export type DaoFilter = {
  chainId: number
  address: string
}

export type ProfileToken = {
  chainId: number
  chainSlug: string
  chainName: string
  tokenId: string
  tokenContract: string
  name: string
  image: string
  mintedAt: string
  daoName: string
  daoSymbol: string
  daoImage?: string
}

export type ProfileActivityKind =
  | 'bid'
  | 'win'
  | 'settled'
  | 'proposal'
  | 'vote'
  | 'update'
  | 'execution'

export type ProfileActivityGroup = 'auction' | 'governance'

export type ProfileActivityFilterOption = {
  value: ProfileActivityKind
  label: string
}

export type ClassifiedProfileActivity = {
  group: ProfileActivityGroup
  kind: ProfileActivityKind
}

export const AUCTION_EVENT_TYPES = ['AUCTION_BID_PLACED', 'AUCTION_SETTLED'] as const

export const GOVERNANCE_EVENT_TYPES = [
  'PROPOSAL_CREATED',
  'PROPOSAL_VOTED',
  'PROPOSAL_UPDATED',
  'PROPOSAL_EXECUTED',
] as const

export const AUCTION_ACTIVITY_FILTER_OPTIONS: ProfileActivityFilterOption[] = [
  { value: 'bid', label: 'Bids' },
  { value: 'win', label: 'Wins' },
  { value: 'settled', label: 'Settles' },
]

export const GOVERNANCE_ACTIVITY_FILTER_OPTIONS: ProfileActivityFilterOption[] = [
  { value: 'proposal', label: 'Proposal creation' },
  { value: 'vote', label: 'Votes' },
  { value: 'update', label: 'Proposal updates' },
  { value: 'execution', label: 'Executions' },
]

export const getInitialProfileTokenVisibleCount = (total: number) =>
  total <= 16 ? total : Math.min(total, 32)

export const normalizeProfileAddress = (address: string) => address.trim().toLowerCase()

export const isOwnProfileAddress = (connectedAddress?: string, profileAddress?: string) =>
  !!connectedAddress &&
  !!profileAddress &&
  normalizeProfileAddress(connectedAddress) === normalizeProfileAddress(profileAddress)

export const createDaoKey = (chainId: number, address: string) =>
  `${chainId}:${normalizeProfileAddress(address)}`

export const parseDaoKey = (value: string): DaoFilter | null => {
  const [rawChainId, rawAddress, ...remainder] = value.trim().split(':')
  const chainId = Number(rawChainId)

  if (!rawAddress || remainder.length || !Number.isInteger(chainId) || chainId <= 0) {
    return null
  }

  return { chainId, address: normalizeProfileAddress(rawAddress) }
}

export const parseDaoKeys = (value?: string | string[]) => {
  const raw = Array.isArray(value) ? value.join(',') : value
  if (!raw) return []

  return Array.from(
    new Set(
      raw
        .split(',')
        .map((entry) => parseDaoKey(entry))
        .filter((entry): entry is DaoFilter => entry !== null)
        .map((entry) => createDaoKey(entry.chainId, entry.address))
    )
  )
}

export const toggleDaoSelection = (selectedKeys: string[], nextKey: string) => {
  const normalizedSelection = parseDaoKeys(selectedKeys)
  const normalizedNextKey = parseDaoKeys(nextKey)[0]
  if (!normalizedNextKey) return normalizedSelection

  return normalizedSelection.includes(normalizedNextKey)
    ? normalizedSelection.filter((key) => key !== normalizedNextKey)
    : [...normalizedSelection, normalizedNextKey]
}

export const matchesDaoSelection = (
  chainId: number,
  daoAddress: string,
  selectedKeys: string[]
) => !selectedKeys.length || selectedKeys.includes(createDaoKey(chainId, daoAddress))

export const createTokenKey = (
  token: Pick<ProfileToken, 'chainId' | 'tokenContract' | 'tokenId'>
) => `${createDaoKey(token.chainId, token.tokenContract)}:${token.tokenId}`

export const dedupeProfileTokens = (tokens: ProfileToken[]) => {
  const seen = new Set<string>()
  return tokens.filter((token) => {
    const key = createTokenKey(token)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const filterProfileTokens = (tokens: ProfileToken[], selectedKeys: string[]) =>
  tokens.filter((token) =>
    matchesDaoSelection(token.chainId, token.tokenContract, selectedKeys)
  )

const sameAddress = (left?: string, right?: string) =>
  !!left && !!right && normalizeProfileAddress(left) === normalizeProfileAddress(right)

export const classifyProfileActivity = (
  item: FeedItem,
  profileAddress: string
): ClassifiedProfileActivity | null => {
  switch (item.type) {
    case 'AUCTION_BID_PLACED':
      return sameAddress(item.bidder, profileAddress)
        ? { group: 'auction', kind: 'bid' }
        : null
    case 'AUCTION_SETTLED':
      if (sameAddress(item.winner, profileAddress)) {
        return { group: 'auction', kind: 'win' }
      }
      return sameAddress(item.actor, profileAddress)
        ? { group: 'auction', kind: 'settled' }
        : null
    case 'PROPOSAL_CREATED':
      return sameAddress(item.proposer, profileAddress)
        ? { group: 'governance', kind: 'proposal' }
        : null
    case 'PROPOSAL_VOTED':
      return sameAddress(item.voter, profileAddress)
        ? { group: 'governance', kind: 'vote' }
        : null
    case 'PROPOSAL_UPDATED':
      return sameAddress(item.actor, profileAddress)
        ? { group: 'governance', kind: 'update' }
        : null
    case 'PROPOSAL_EXECUTED':
      return sameAddress(item.actor, profileAddress)
        ? { group: 'governance', kind: 'execution' }
        : null
    default:
      return null
  }
}

export const filterProfileActivity = (
  items: FeedItem[],
  profileAddress: string,
  group: ProfileActivityGroup,
  selectedKeys: string[]
) =>
  items.filter((item) => {
    const classification = classifyProfileActivity(item, profileAddress)
    return (
      classification?.group === group &&
      matchesDaoSelection(item.chainId, item.daoId, selectedKeys)
    )
  })

export const filterProfileActivityByKinds = (
  items: FeedItem[],
  profileAddress: string,
  selectedKinds: ProfileActivityKind[]
) =>
  selectedKinds.length === 0
    ? items
    : items.filter((item) => {
        const kind = classifyProfileActivity(item, profileAddress)?.kind
        return !!kind && selectedKinds.includes(kind)
      })

export type ProfileStats = {
  daos: number
  tokens: number
  votes: number
  proposals: number
  bids: number
}

export const summarizeProfileStats = ({
  daoKeys,
  tokens,
  activity,
  profileAddress,
}: {
  daoKeys: string[]
  tokens: ProfileToken[]
  activity: FeedItem[]
  profileAddress: string
}): ProfileStats => {
  const uniqueActivity = Array.from(
    new Map(activity.map((item) => [`${item.chainId}:${item.id}`, item])).values()
  )

  return {
    daos: new Set(parseDaoKeys(daoKeys)).size,
    tokens: dedupeProfileTokens(tokens).length,
    votes: uniqueActivity.filter(
      (item) => classifyProfileActivity(item, profileAddress)?.kind === 'vote'
    ).length,
    proposals: uniqueActivity.filter(
      (item) => classifyProfileActivity(item, profileAddress)?.kind === 'proposal'
    ).length,
    bids: uniqueActivity.filter(
      (item) => classifyProfileActivity(item, profileAddress)?.kind === 'bid'
    ).length,
  }
}

export type ChainResult<T> = {
  chainId: number
  data?: T[]
  error?: string
  isComplete: boolean
}

export const combineChainResults = <T>(results: ChainResult<T>[]) => ({
  data: results.flatMap((result) => result.data ?? []),
  failedChainIds: results
    .filter((result) => result.error)
    .map((result) => result.chainId),
  isComplete: results.every((result) => result.isComplete && !result.error),
})
