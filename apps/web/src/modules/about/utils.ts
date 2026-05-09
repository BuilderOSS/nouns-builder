import removeMd from 'remove-markdown'

export const getChainLogoSrc = (chainName?: string | null) => {
  const normalized = chainName?.trim().toLowerCase()

  switch (normalized) {
    case 'base':
      return '/chains/base.svg'
    case 'ethereum':
      return '/chains/ethereum.svg'
    case 'optimism':
      return '/chains/optimism.svg'
    case 'zora':
      return '/chains/zora.png'
    default:
      return null
  }
}

export const toPlainText = (value?: string | null) =>
  removeMd(value || '')
    .replace(/\s+/g, ' ')
    .trim()
