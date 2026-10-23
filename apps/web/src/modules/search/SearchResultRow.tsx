import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import type {
  BidGlobalSearchResult,
  CandidateGlobalSearchResult,
  DaoGlobalSearchResult,
  GlobalSearchResult,
  ProfileGlobalSearchResult,
  ProposalGlobalSearchResult,
  SearchDaoRef,
  VoteGlobalSearchResult,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID, ProposalState } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { bgForAddress } from '@buildeross/utils/gradient'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { formatEther } from 'viem'

import * as styles from './GlobalSearch.css'
import { getSearchResultHref } from './links'

const PROPOSAL_STATE_LABEL: Record<ProposalState, string> = {
  [ProposalState.Pending]: 'Pending',
  [ProposalState.Active]: 'Active',
  [ProposalState.Canceled]: 'Canceled',
  [ProposalState.Defeated]: 'Defeated',
  [ProposalState.Succeeded]: 'Succeeded',
  [ProposalState.Queued]: 'Queued',
  [ProposalState.Expired]: 'Expired',
  [ProposalState.Executed]: 'Executed',
  [ProposalState.Vetoed]: 'Vetoed',
  [ProposalState.Updatable]: 'Updatable',
  [ProposalState.Replaced]: 'Replaced',
}

const proposalBadgeClass = (state: ProposalState) => {
  if (state === ProposalState.Active || state === ProposalState.Pending)
    return styles.badgeAccent
  if (
    state === ProposalState.Executed ||
    state === ProposalState.Succeeded ||
    state === ProposalState.Queued
  )
    return styles.badgePositive
  if (state === ProposalState.Defeated || state === ProposalState.Vetoed)
    return styles.badgeNegative
  return styles.badge
}

const SUPPORT_LABEL = { FOR: 'For', AGAINST: 'Against', ABSTAIN: 'Abstain' } as const

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Bolds the parts of `text` that match words of `query`. */
export const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map(escapeRegExp)
  if (!terms.length) return <>{text}</>
  const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={styles.mark}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  )
}

/** Trims long text to a window around the first matching term. */
const snippetAround = (text: string, query: string, radius = 60): string => {
  const clean = text.replace(/\s+/g, ' ').trim()
  const lower = clean.toLowerCase()
  const term = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .find((t) => t.length >= 2 && lower.includes(t))
  const at = term ? lower.indexOf(term) : 0
  const start = Math.max(0, at - radius)
  const end = Math.min(clean.length, at + radius * 2)
  return `${start > 0 ? '…' : ''}${clean.slice(start, end)}${end < clean.length ? '…' : ''}`
}

const timeAgo = (seconds: number): string => {
  if (!seconds) return ''
  const diff = Math.max(0, Date.now() / 1000 - seconds)
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'y'],
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [size, label] of units) {
    if (diff >= size) return `${Math.floor(diff / size)}${label} ago`
  }
  return 'just now'
}

const ChainIcon: React.FC<{ chainId: CHAIN_ID }> = ({ chainId }) => {
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
  if (!chain) return null
  return (
    <Image
      src={chain.icon}
      alt={chain.name}
      title={chain.name}
      width={16}
      height={16}
      className={styles.chainIcon}
    />
  )
}

/** Square thumbnail with the address gradient as a fallback. */
const SquareImage: React.FC<{ address: string; src?: string | null; alt: string }> = ({
  address,
  src,
  alt,
}) => {
  const [failed, setFailed] = useState(false)
  return (
    <span
      className={styles.rowMedia}
      style={{ background: bgForAddress(address, failed ? null : src) }}
    >
      {src && !failed && (
        <FallbackImage
          src={src}
          alt={alt}
          width={36}
          height={36}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onImageError={() => setFailed(true)}
        />
      )}
    </span>
  )
}

const DaoImage: React.FC<{ dao: SearchDaoRef }> = ({ dao }) => (
  <SquareImage address={dao.tokenAddress} src={dao.image} alt={dao.name} />
)

const Name: React.FC<{ address: string }> = ({ address }) => {
  const { displayName } = useEnsData(address)
  return <>{displayName || walletSnippet(address)}</>
}

type RowLayoutProps = {
  media: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  snippet?: React.ReactNode
  aside?: React.ReactNode
}

const RowLayout: React.FC<RowLayoutProps> = ({ media, title, meta, snippet, aside }) => (
  <>
    {media}
    <span className={styles.rowBody}>
      <span className={styles.rowTitle}>{title}</span>
      {meta && <span className={styles.rowMeta}>{meta}</span>}
      {snippet && <span className={styles.rowSnippet}>{snippet}</span>}
    </span>
    {aside && <span className={styles.rowAside}>{aside}</span>}
  </>
)

const DaoRow: React.FC<{ result: DaoGlobalSearchResult; query: string }> = ({
  result,
  query,
}) => (
  <RowLayout
    media={<DaoImage dao={result.dao} />}
    title={<Highlight text={result.dao.name} query={query} />}
    meta={`${result.dao.symbol} · ${result.dao.totalSupply} tokens · ${result.dao.ownerCount} owners`}
    aside={<ChainIcon chainId={result.chainId} />}
  />
)

const ProfileRow: React.FC<{ result: ProfileGlobalSearchResult }> = ({ result }) => {
  const { displayName, ensAvatar } = useEnsData(result.name || result.address)
  const totals = result.chains.reduce(
    (acc, c) => ({
      daos: acc.daos + c.ownerDaoCount,
      votes: acc.votes + c.proposalVotesCount,
      bids: acc.bids + c.bidsPlacedCount,
    }),
    { daos: 0, votes: 0, bids: 0 }
  )
  const meta = result.chains.length
    ? `${totals.daos} DAOs · ${totals.votes} votes · ${totals.bids} bids`
    : 'No onchain activity yet'
  return (
    <RowLayout
      media={
        <span className={styles.rowMedia}>
          <Avatar address={result.address} src={ensAvatar} size="32" />
        </span>
      }
      title={displayName || walletSnippet(result.address)}
      meta={`${walletSnippet(result.address)} · ${meta}`}
      aside={result.chains.map((c) => (
        <ChainIcon key={c.chainId} chainId={c.chainId} />
      ))}
    />
  )
}

const ProposalRow: React.FC<{ result: ProposalGlobalSearchResult; query: string }> = ({
  result,
  query,
}) => (
  <RowLayout
    media={<DaoImage dao={result.dao} />}
    title={
      <>
        #{result.proposalNumber} <Highlight text={result.title} query={query} />
      </>
    }
    meta={
      <>
        {result.dao.name} · {result.forVotes} for · {result.againstVotes} against ·{' '}
        {timeAgo(result.timeCreated)}
      </>
    }
    aside={
      <>
        <span className={proposalBadgeClass(result.state)}>
          {PROPOSAL_STATE_LABEL[result.state]}
        </span>
        <ChainIcon chainId={result.chainId} />
      </>
    }
  />
)

const CandidateRow: React.FC<{ result: CandidateGlobalSearchResult; query: string }> = ({
  result,
  query,
}) => (
  <RowLayout
    media={<DaoImage dao={result.dao} />}
    title={<Highlight text={result.title} query={query} />}
    meta={
      <>
        {result.dao.name} · Candidate {result.candidateNumber} by{' '}
        <Name address={result.proposer} /> · {timeAgo(result.createdAt)}
      </>
    }
    aside={
      <>
        {result.proposalNumber !== undefined && (
          <span className={styles.badgePositive}>Prop #{result.proposalNumber}</span>
        )}
        <ChainIcon chainId={result.chainId} />
      </>
    }
  />
)

const VoteRow: React.FC<{ result: VoteGlobalSearchResult; query: string }> = ({
  result,
  query,
}) => (
  <RowLayout
    media={
      <span className={styles.rowMedia}>
        <Avatar address={result.voter} size="32" />
      </span>
    }
    title={
      <>
        <Name address={result.voter} /> voted{' '}
        <span
          className={
            result.support === 'FOR'
              ? styles.badgePositive
              : result.support === 'AGAINST'
                ? styles.badgeNegative
                : styles.badge
          }
        >
          {SUPPORT_LABEL[result.support]} · {result.weight}
        </span>
      </>
    }
    meta={`${result.dao.name} #${result.proposalNumber} ${result.proposalTitle} · ${timeAgo(result.timestamp)}`}
    snippet={
      result.reason ? (
        <Highlight text={snippetAround(result.reason, query)} query={query} />
      ) : undefined
    }
    aside={<ChainIcon chainId={result.chainId} />}
  />
)

const BidRow: React.FC<{ result: BidGlobalSearchResult; query: string }> = ({
  result,
  query,
}) => (
  <RowLayout
    media={
      <SquareImage
        address={result.dao.tokenAddress}
        src={result.tokenImage ?? result.dao.image}
        alt={result.tokenName}
      />
    }
    title={
      <>
        <Name address={result.bidder} /> bid{' '}
        {formatCryptoVal(formatEther(BigInt(result.amount)))} ETH
      </>
    }
    meta={`${result.tokenName} · ${timeAgo(result.bidTime)}`}
    snippet={
      result.comment ? (
        <Highlight text={snippetAround(result.comment, query)} query={query} />
      ) : undefined
    }
    aside={<ChainIcon chainId={result.chainId} />}
  />
)

const RowContent: React.FC<{ result: GlobalSearchResult; query: string }> = ({
  result,
  query,
}) => {
  switch (result.type) {
    case 'dao':
      return <DaoRow result={result} query={query} />
    case 'profile':
      return <ProfileRow result={result} />
    case 'proposal':
      return <ProposalRow result={result} query={query} />
    case 'candidate':
      return <CandidateRow result={result} query={query} />
    case 'vote':
      return <VoteRow result={result} query={query} />
    case 'bid':
      return <BidRow result={result} query={query} />
  }
}

export type SearchResultRowProps = {
  result: GlobalSearchResult
  query: string
  id?: string
  active?: boolean
  onSelect?: (result: GlobalSearchResult) => void
  onHover?: () => void
  role?: string
}

export const SearchResultRow: React.FC<SearchResultRowProps> = ({
  result,
  query,
  id,
  active,
  onSelect,
  onHover,
  role,
}) => (
  <Link
    href={getSearchResultHref(result)}
    id={id}
    role={role}
    aria-selected={role === 'option' ? !!active : undefined}
    data-active={active ? 'true' : undefined}
    className={styles.row}
    onClick={() => onSelect?.(result)}
    onMouseMove={onHover}
    tabIndex={role === 'option' ? -1 : undefined}
  >
    <RowContent result={result} query={query} />
  </Link>
)
