import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import removeMd from 'remove-markdown'

const normalizeChainLabel = (value?: string | null) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const CHAIN_ICON_BY_LABEL = new Map(
  PUBLIC_DEFAULT_CHAINS.flatMap((chain) => {
    const labels = [chain.name, chain.slug].filter(Boolean).map(normalizeChainLabel)
    const fallbackLabels = labels.flatMap((label) => {
      if (!label.includes('sepolia')) return []

      return [label.replace(/\s*sepolia$/, '').trim()]
    })

    return [...labels, ...fallbackLabels]
      .filter(Boolean)
      .map((label) => [label, chain.icon] as const)
  })
)

export const getChainLogoSrc = (chainName?: string | null) =>
  CHAIN_ICON_BY_LABEL.get(normalizeChainLabel(chainName)) || null

export const toPlainText = (value?: string | null) =>
  removeMd(value || '')
    .replace(/\s+/g, ' ')
    .trim()
