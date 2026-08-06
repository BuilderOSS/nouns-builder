import { tokenAbi } from '@buildeross/sdk/contract'
import { executeAppTransactions } from '@buildeross/sdk/transaction'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { getEnsAddress } from '@buildeross/utils/ens'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Button, Icon, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import {
  activityKindDropdown,
  compactFilterChevron,
  compactFilterSelect,
  loadingSkeleton,
  profileChainFallbackNoBackground,
  profileEmptyState,
  profileNotice,
  profileSection,
  profileSectionHeader,
  profileSurface,
  tokenCard,
  tokenCardBody,
  tokenCardChainBadge,
  tokenCardChainBadgeLogo,
  tokenCardIdBadge,
  tokenCardImage,
  tokenCardMeta,
  tokenCardSelected,
  tokenCardSelectionBadge,
  tokenCardSelectionBadgeActive,
  tokenCardSelectionButton,
  tokenGalleryBody,
  tokenGalleryHeaderLeft,
  tokenGalleryHeaderRight,
  tokenGalleryToggle,
  tokenGalleryToggleIcon,
  tokenGrid,
  tokenGridItem,
  tokenGridViewport,
  tokenGridViewportLocked,
  tokenSectionHeaderCollapsed,
  tokenTransferBackButton,
  tokenTransferInput,
  tokenTransferPreview,
  tokenTransferPreviewGrid,
  tokenTransferReview,
  tokenTransferTray,
  tokenTransferTrayRow,
  tokenTransferWarning,
} from 'src/styles/profile.css'
import {
  createTokenKey,
  filterProfileTokens,
  getInitialProfileTokenVisibleCount,
  type ProfileToken,
} from 'src/utils/profileDashboard'
import type { TokenSortOption } from 'src/utils/profileIdentity'
import type { WriteContractParameters } from 'viem'
import { isAddress } from 'viem'
import { useConfig } from 'wagmi'
import { simulateContract } from 'wagmi/actions'

import { ProfileChainIcon } from './ProfileChainIcon'

type ProfileTokenGalleryProps = {
  tokens: ProfileToken[]
  isLoading: boolean
  selectedDaoKeys: string[]
  sort: TokenSortOption
  onSortChange: (sort: TokenSortOption) => void
  failedChainNames: string[]
  truncatedChainNames: string[]
  onRetry: () => void
  onExpand?: () => void
  canTransferTokens?: boolean
  profileAddress?: AddressType
  onTransferComplete?: () => void
}

type TransferStep = 'entry' | 'review'

type TokenTransferTrayProps = {
  selectedTokens: ProfileToken[]
  profileAddress: AddressType
  onClear: () => void
  onTransferComplete?: () => void
}

const sortTokens = (tokens: ProfileToken[], sort: TokenSortOption) =>
  [...tokens].sort((left, right) => {
    if (sort === 'oldest') return Number(left.mintedAt) - Number(right.mintedAt)
    if (sort === 'dao-name-asc') return left.daoName.localeCompare(right.daoName)
    if (sort === 'token-id-asc') return Number(left.tokenId) - Number(right.tokenId)
    if (sort === 'token-id-desc') return Number(right.tokenId) - Number(left.tokenId)
    return Number(right.mintedAt) - Number(left.mintedAt)
  })

const TokenTransferTray: React.FC<TokenTransferTrayProps> = ({
  selectedTokens,
  profileAddress,
  onClear,
  onTransferComplete,
}) => {
  const config = useConfig()
  const [recipient, setRecipient] = React.useState('')
  const [resolvedRecipient, setResolvedRecipient] = React.useState<AddressType | null>(
    null
  )
  const [step, setStep] = React.useState<TransferStep>('entry')
  const [error, setError] = React.useState<string | null>(null)
  const [txHashes, setTxHashes] = React.useState<`0x${string}`[]>([])
  const [isSending, setIsSending] = React.useState(false)
  const recipientInputId = 'profile-token-transfer-recipient'
  const selectedChainId = selectedTokens[0]?.chainId as CHAIN_ID | undefined

  React.useEffect(() => {
    setRecipient('')
    setResolvedRecipient(null)
    setStep('entry')
    setError(null)
    setTxHashes([])
    setIsSending(false)
  }, [selectedTokens.length])

  const resolveRecipient = async () => {
    const trimmedRecipient = recipient.trim()
    if (!trimmedRecipient) return

    setError(null)
    try {
      const resolved = isAddress(trimmedRecipient, { strict: false })
        ? trimmedRecipient
        : await getEnsAddress(trimmedRecipient)

      if (!isAddress(resolved, { strict: false })) {
        setError('Enter a valid wallet address or ENS name.')
        return
      }

      setResolvedRecipient(resolved as AddressType)
      setStep('review')
    } catch (err) {
      console.error('Failed to resolve NFT transfer recipient:', err)
      setError('Unable to resolve this recipient. Check the ENS or wallet address.')
    }
  }

  const sendTransfer = async () => {
    if (!resolvedRecipient || !selectedChainId) return

    setError(null)
    setTxHashes([])
    setIsSending(true)

    const hashes: `0x${string}`[] = []

    try {
      const requests: WriteContractParameters[] = []
      for (const token of selectedTokens) {
        const data = await simulateContract(config, {
          abi: tokenAbi,
          address: token.tokenContract as AddressType,
          chainId: token.chainId,
          functionName: 'safeTransferFrom',
          args: [profileAddress, resolvedRecipient, BigInt(token.tokenId)],
        })
        requests.push(data.request)
      }

      const result = await executeAppTransactions({
        config,
        requests,
        chainId: selectedChainId,
      })
      if (!Array.isArray(result)) {
        if (result.kind === 'safe-proposed') {
          setError(
            `${selectedTokens.length} transfer${selectedTokens.length === 1 ? '' : 's'} proposed to your Safe. Other owners must sign and execute it before the NFTs move.`
          )
          return
        }
        setTxHashes([result.hash])
        hashes.push(result.hash)
      } else {
        result.forEach((item) => {
          if (item.kind === 'mined') {
            setTxHashes((current) => [...current, item.hash])
            hashes.push(item.hash)
          }
        })
      }
      onTransferComplete?.()
    } catch (err) {
      console.error('Failed to transfer selected NFTs:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Transfer failed. Check your wallet and try again.'
      )
      if (hashes.length > 0) onTransferComplete?.()
    } finally {
      setIsSending(false)
    }
  }

  if (!selectedTokens.length || !selectedChainId) return null

  return (
    <div
      className={tokenTransferTray}
      role="region"
      aria-label="Transfer selected tokens"
    >
      <div className={tokenTransferTrayRow}>
        <div style={{ minWidth: 0, flex: '1 1 180px' }}>
          <Text fontWeight="display">
            {step === 'review' ? 'Review transfer' : 'Transfer'}
          </Text>
          <Text color="text3" fontSize="12">
            {selectedTokens.length} token{selectedTokens.length === 1 ? '' : 's'} selected
          </Text>
        </div>

        {step === 'entry' ? (
          <>
            <label
              htmlFor={recipientInputId}
              style={{ position: 'absolute', left: -9999 }}
            >
              Recipient ENS or wallet address
            </label>
            <input
              id={recipientInputId}
              className={tokenTransferInput}
              value={recipient}
              onChange={(event) => {
                setRecipient(event.target.value)
                setResolvedRecipient(null)
                setError(null)
              }}
              placeholder="ENS or wallet address"
              autoComplete="off"
            />
            {recipient.trim() ? (
              <Button type="button" size="sm" onClick={resolveRecipient}>
                Continue
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <div className={tokenTransferReview}>
              <Text>
                Sending {selectedTokens.map((token) => `#${token.tokenId}`).join(', ')} to{' '}
                {recipient.trim()}
                {resolvedRecipient ? ` (${walletSnippet(resolvedRecipient)})` : ''}.
              </Text>
              <div className={tokenTransferPreviewGrid} aria-label="Tokens to transfer">
                {selectedTokens.map((token) => (
                  <div key={createTokenKey(token)} className={tokenTransferPreview}>
                    <FallbackImage src={token.image} alt={token.name} sizes="40px" />
                  </div>
                ))}
              </div>
              <div className={tokenTransferWarning} role="alert">
                <Icon id="warning" size="sm" fill="warning" />
                <Text>
                  We are not responsible for mistakes. This action is permanent, and we
                  cannot help recover lost assets sent to the wrong recipient.
                </Text>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className={tokenTransferBackButton}
              onClick={() => setStep('entry')}
            >
              Back
            </Button>
            <ContractButton
              chainId={selectedChainId}
              handleClick={sendTransfer}
              disabled={isSending || txHashes.length > 0}
              loading={isSending}
              size="sm"
            >
              {txHashes.length > 0 ? 'Sent' : 'Send'}
            </ContractButton>
          </>
        )}

        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          Cancel
        </Button>
      </div>

      {error ? (
        <Text color="negative" fontSize="12" style={{ marginTop: 8 }}>
          {error}
        </Text>
      ) : null}
      {txHashes.length ? (
        <Text color="positive" fontSize="12" style={{ marginTop: 8 }}>
          Transfer submitted.
        </Text>
      ) : null}
    </div>
  )
}

export const ProfileTokenGallery: React.FC<ProfileTokenGalleryProps> = ({
  tokens,
  isLoading,
  selectedDaoKeys,
  sort,
  onSortChange,
  failedChainNames,
  truncatedChainNames,
  onRetry,
  onExpand,
  canTransferTokens = false,
  profileAddress,
  onTransferComplete,
}) => {
  const filteredTokens = React.useMemo(
    () => sortTokens(filterProfileTokens(tokens, selectedDaoKeys), sort),
    [selectedDaoKeys, sort, tokens]
  )
  const [visibleCount, setVisibleCount] = React.useState(() =>
    getInitialProfileTokenVisibleCount(filteredTokens.length)
  )
  const [isViewportLocked, setIsViewportLocked] = React.useState(false)
  const [viewportHeight, setViewportHeight] = React.useState<number | null>(null)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const gridRef = React.useRef<HTMLUListElement>(null)
  const initialBoundaryRef = React.useRef<HTMLElement>(null)
  const initialVisibleCount = getInitialProfileTokenVisibleCount(filteredTokens.length)
  const daoFilterKey = selectedDaoKeys.join(',')
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [selectedTokenKeys, setSelectedTokenKeys] = React.useState<string[]>([])
  const [selectionError, setSelectionError] = React.useState<string | null>(null)

  const toggleExpanded = () => {
    const nextIsExpanded = !isExpanded
    setIsExpanded(nextIsExpanded)
    if (nextIsExpanded) onExpand?.()
  }

  const measureInitialViewport = React.useCallback(() => {
    const grid = gridRef.current
    const boundary = initialBoundaryRef.current
    if (!grid || !boundary) return

    const height = Math.ceil(
      boundary.getBoundingClientRect().bottom - grid.getBoundingClientRect().top
    )
    if (height > 0)
      setViewportHeight((current) => (current === height ? current : height))
  }, [])

  React.useLayoutEffect(() => {
    setVisibleCount(initialVisibleCount)
    setIsViewportLocked(false)
    setViewportHeight(null)
    if (viewportRef.current) viewportRef.current.scrollTop = 0
  }, [daoFilterKey, initialVisibleCount, sort])

  React.useEffect(() => {
    const visibleKeys = new Set(filteredTokens.map((token) => createTokenKey(token)))
    setSelectedTokenKeys((keys) => keys.filter((key) => visibleKeys.has(key)))
  }, [filteredTokens])

  React.useLayoutEffect(() => {
    if (!isViewportLocked) return

    measureInitialViewport()
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measureInitialViewport)
    if (gridRef.current) resizeObserver?.observe(gridRef.current)
    if (initialBoundaryRef.current) resizeObserver?.observe(initialBoundaryRef.current)
    window.addEventListener('resize', measureInitialViewport)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measureInitialViewport)
    }
  }, [isViewportLocked, measureInitialViewport])

  const loadMore = () => {
    measureInitialViewport()
    setIsViewportLocked(true)
    setVisibleCount((count) => Math.min(filteredTokens.length, count + 32))
  }

  const setInitialBoundaryNode = React.useCallback((node: HTMLElement | null) => {
    initialBoundaryRef.current = node
  }, [])

  const selectedTokens = React.useMemo(
    () =>
      selectedTokenKeys
        .map((key) => filteredTokens.find((token) => createTokenKey(token) === key))
        .filter((token): token is ProfileToken => !!token),
    [filteredTokens, selectedTokenKeys]
  )

  const toggleTokenSelection = (token: ProfileToken) => {
    const tokenKey = createTokenKey(token)
    setSelectionError(null)
    setSelectedTokenKeys((keys) => {
      if (keys.includes(tokenKey)) return keys.filter((key) => key !== tokenKey)

      const selectedChainIds = selectedTokens.map(
        (selectedToken) => selectedToken.chainId
      )
      if (selectedChainIds.length && !selectedChainIds.includes(token.chainId)) {
        setSelectionError('Select tokens from one chain at a time.')
        return keys
      }

      return [...keys, tokenKey]
    })
  }

  return (
    <section className={profileSurface} aria-labelledby="profile-tokens-heading">
      <div className={profileSection}>
        <div
          className={
            isExpanded
              ? profileSectionHeader
              : `${profileSectionHeader} ${tokenSectionHeaderCollapsed}`
          }
        >
          <div className={tokenGalleryHeaderLeft}>
            <Text as="h3" id="profile-tokens-heading" variant="heading-sm">
              Tokens
            </Text>
            <button
              className={tokenGalleryToggle}
              type="button"
              onClick={toggleExpanded}
              aria-expanded={isExpanded}
              aria-controls="profile-token-content"
              aria-label={
                isExpanded ? 'Collapse tokens section' : 'Expand tokens section'
              }
            >
              <Icon
                className={tokenGalleryToggleIcon}
                id={isExpanded ? 'chevron-down' : 'chevron-right'}
                fill="tertiary"
              />
            </button>
          </div>
          {isExpanded ? (
            <div className={tokenGalleryHeaderRight}>
              <label className={activityKindDropdown}>
                <span
                  style={{
                    position: 'absolute',
                    width: 1,
                    height: 1,
                    overflow: 'hidden',
                  }}
                >
                  Sort tokens
                </span>
                <select
                  className={compactFilterSelect}
                  value={sort}
                  onChange={(event) =>
                    onSortChange(event.target.value as TokenSortOption)
                  }
                  aria-label="Sort tokens"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="dao-name-asc">DAO name</option>
                  <option value="token-id-asc">Token ID ascending</option>
                  <option value="token-id-desc">Token ID descending</option>
                </select>
                <span className={compactFilterChevron} aria-hidden="true">
                  <Icon id="chevron-down" fill="tertiary" pointerEvents="none" />
                </span>
              </label>
            </div>
          ) : null}
        </div>

        {isExpanded ? (
          <div id="profile-token-content" className={tokenGalleryBody}>
            {failedChainNames.length ? (
              <div className={profileNotice} role="status">
                Some chains are unavailable ({failedChainNames.join(', ')}). Successful
                chain results are still shown.{' '}
                <button type="button" onClick={onRetry}>
                  Retry
                </button>
              </div>
            ) : null}

            {truncatedChainNames.length ? (
              <div className={profileNotice} role="status">
                Some chains reached the dashboard result limit (
                {truncatedChainNames.join(', ')}). Results shown may be incomplete.
              </div>
            ) : null}

            {selectionError ? (
              <div className={profileNotice} role="status">
                {selectionError}
              </div>
            ) : null}

            {isLoading && !tokens.length ? (
              <div className={tokenGrid} aria-busy="true" aria-label="Loading tokens">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className={[tokenCard, loadingSkeleton].join(' ')}
                    style={{ aspectRatio: '1 / 1.25' }}
                  />
                ))}
              </div>
            ) : !filteredTokens.length ? (
              <div className={profileEmptyState} role="status">
                <Text fontWeight="display">
                  {selectedDaoKeys.length
                    ? 'No tokens match these DAOs'
                    : 'No DAO tokens held'}
                </Text>
                <Text color="text3">
                  {selectedDaoKeys.length
                    ? 'Clear the DAO filter to see tokens from every supported chain.'
                    : 'Tokens currently owned by this wallet will appear here.'}
                </Text>
              </div>
            ) : (
              <>
                <div
                  ref={viewportRef}
                  className={[
                    tokenGridViewport,
                    isViewportLocked && tokenGridViewportLocked,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="region"
                  aria-label="Tokens held gallery"
                  tabIndex={isViewportLocked ? 0 : undefined}
                  style={
                    isViewportLocked && viewportHeight
                      ? { height: `${viewportHeight}px` }
                      : undefined
                  }
                >
                  <ul ref={gridRef} className={tokenGrid}>
                    {filteredTokens.slice(0, visibleCount).map((token, index) => {
                      const tokenKey = createTokenKey(token)
                      const isSelected = selectedTokenKeys.includes(tokenKey)
                      const cardClassName = [
                        tokenCard,
                        isSelected ? tokenCardSelected : undefined,
                      ]
                        .filter(Boolean)
                        .join(' ')
                      const cardContent = (
                        <>
                          <div className={tokenCardImage}>
                            <FallbackImage
                              src={token.image}
                              alt={token.name}
                              sizes="25vw"
                            />
                            <span className={tokenCardChainBadge}>
                              <ProfileChainIcon
                                chainId={token.chainId}
                                chainSlug={token.chainSlug}
                                chainName={token.chainName}
                                imageClassName={tokenCardChainBadgeLogo}
                                fallbackClassName={profileChainFallbackNoBackground}
                              />
                            </span>
                          </div>
                          <div className={tokenCardBody}>
                            <span className={tokenCardMeta}>
                              <Text fontSize="12">{token.daoName}</Text>
                              <Text
                                className={tokenCardIdBadge}
                              >{`#${token.tokenId}`}</Text>
                            </span>
                          </div>
                        </>
                      )

                      return (
                        <li
                          key={`${token.chainId}:${token.tokenContract}:${token.tokenId}`}
                          className={tokenGridItem}
                        >
                          {canTransferTokens ? (
                            <button
                              type="button"
                              className={[
                                tokenCardSelectionButton,
                                tokenCardSelectionBadge,
                                isSelected ? tokenCardSelectionBadgeActive : undefined,
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={() => toggleTokenSelection(token)}
                              aria-pressed={isSelected}
                              aria-label={`${isSelected ? 'Deselect' : 'Select'} ${token.name} #${token.tokenId} for transfer`}
                            >
                              {isSelected ? <Icon id="check" size="sm" /> : null}
                            </button>
                          ) : null}
                          <Link
                            ref={
                              index === initialVisibleCount - 1
                                ? setInitialBoundaryNode
                                : undefined
                            }
                            href={`/dao/${token.chainSlug}/${token.tokenContract}/${token.tokenId}`}
                            className={cardClassName}
                          >
                            {cardContent}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                {visibleCount < filteredTokens.length ? (
                  <div
                    style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}
                  >
                    <Button size="sm" variant="outline" onClick={loadMore}>
                      Load more
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
      {canTransferTokens && profileAddress ? (
        <TokenTransferTray
          selectedTokens={selectedTokens}
          profileAddress={profileAddress}
          onClear={() => {
            setSelectedTokenKeys([])
            setSelectionError(null)
          }}
          onTransferComplete={onTransferComplete}
        />
      ) : null}
    </section>
  )
}
