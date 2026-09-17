import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import Image from 'next/image'
import React, { useState } from 'react'
import { profileChainFallback, profileChainIcon } from 'src/styles/profile.css'

const chainsById = new Map(PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain]))
const chainsBySlug = new Map(
  PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.slug.toLowerCase(), chain])
)
const chainsByName = new Map(
  PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.name.toLowerCase(), chain])
)

const fallbackChainAliases: Array<[string, string]> = [
  ['mainnet', 'ethereum'],
  ['homestead', 'ethereum'],
  ['eth', 'ethereum'],
  ['ethereum mainnet', 'ethereum'],
  ['ethereum-mainnet', 'ethereum'],
]

const chainAliasesById = new Map(
  fallbackChainAliases.map(([alias, slug]) => [alias, chainsBySlug.get(slug)])
)

const normalizeToken = (value?: string) =>
  value?.toLowerCase().trim().replace(/\s+/g, ' ')

const normalizeInput = (chainId?: number | string): number | undefined => {
  if (typeof chainId === 'bigint') return Number(chainId)
  if (typeof chainId === 'number' && Number.isSafeInteger(chainId)) return chainId
  if (typeof chainId === 'string') {
    const parsed = Number(chainId.trim())
    if (Number.isSafeInteger(parsed)) return parsed

    const parsedHex = Number.parseInt(chainId.trim(), 16)
    return Number.isSafeInteger(parsedHex) ? parsedHex : undefined
  }
  return undefined
}

export const getProfileChainMetadata = (
  chainId?: number | string,
  chainSlug?: string,
  chainName?: string
) => {
  const parsedChainId = normalizeInput(chainId)
  if (parsedChainId !== undefined) {
    const normalizedChainMetadata = chainsById.get(parsedChainId)
    if (normalizedChainMetadata) return normalizedChainMetadata
  }

  const normalizedSlug = normalizeToken(chainSlug)
  if (normalizedSlug?.includes('ethereum'))
    return chainsBySlug.get('ethereum') ?? undefined

  const directSlugMatch = normalizedSlug ? chainsBySlug.get(normalizedSlug) : undefined
  if (directSlugMatch) return directSlugMatch

  const aliasFromSlug = normalizedSlug ? chainAliasesById.get(normalizedSlug) : undefined
  if (aliasFromSlug) return aliasFromSlug
  const normalizedSlugCompact = normalizedSlug?.replace(/[-\s]/g, '')
  if (normalizedSlugCompact && chainAliasesById.has(normalizedSlugCompact))
    return chainAliasesById.get(normalizedSlugCompact)

  const normalizedName = normalizeToken(chainName)
  if (!normalizedName) return undefined
  if (normalizedName.includes('ethereum'))
    return chainsBySlug.get('ethereum') ?? undefined
  const directNameMatch = chainsByName.get(normalizedName)
  if (directNameMatch) return directNameMatch
  return chainsByName.get(normalizedName.replace(/[-\s]/g, ''))
}

type ProfileChainIconProps = {
  chainId?: number | string
  chainSlug?: string
  chainName?: string
  imageClassName?: string
  fallbackClassName?: string
}

export const ProfileChainIcon: React.FC<ProfileChainIconProps> = ({
  chainId,
  chainSlug,
  chainName,
  imageClassName,
  fallbackClassName,
}) => {
  const chain = getProfileChainMetadata(chainId, chainSlug, chainName)
  const [loadFailed, setLoadFailed] = useState(false)

  if (!chain)
    return (
      <span
        className={`${profileChainFallback}${fallbackClassName ? ` ${fallbackClassName}` : ''}`}
        role="img"
        aria-label={`Unknown chain ${chainSlug || chainName || chainId}`}
        title={`Unknown chain ${chainSlug || chainName || chainId}`}
      >
        ?
      </span>
    )

  const icon = chain.icon

  if (!icon || loadFailed) {
    return (
      <span
        className={`${profileChainFallback}${fallbackClassName ? ` ${fallbackClassName}` : ''}`}
        role="img"
        aria-label={`Unknown chain ${chainSlug || chainName || chainId}`}
        title={`Unknown chain ${chainSlug || chainName || chainId}`}
      >
        ?
      </span>
    )
  }

  return (
    <Image
      className={`${profileChainIcon}${imageClassName ? ` ${imageClassName}` : ''}`}
      src={icon}
      alt={`${chain.name} network`}
      title={chain.name}
      width={18}
      height={18}
      onError={() => setLoadFailed(true)}
    />
  )
}
