import { Button, Flex, Icon, IconType } from '@buildeross/zord'
import React from 'react'

import { iconAnchor } from '../../styles/About.css'

interface IconAnchor {
  href: string
  name: IconType
  label?: string
}

const IconAnchor: React.FC<IconAnchor> = ({ href, name, label }) => {
  return (
    <Button
      variant="circleSolid"
      backgroundColor="background2"
      as="a"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      w="x10"
      className={iconAnchor}
      title={label || href}
      aria-label={label || href}
    >
      <Flex
        backgroundColor="background2"
        align="center"
        justify="center"
        borderRadius="phat"
        w="x10"
        h="x10"
      >
        <Icon id={name} />
      </Flex>
    </Button>
  )
}

interface ExternalLinksProps {
  links?: Record<string, string>
}

const normalizeLinkKey = (key: string): string => {
  const normalized = key.trim().toLowerCase()
  return normalized === 'twitter' ? 'x' : normalized
}

const isHttpProtocol = (protocol: string): boolean =>
  protocol === 'http:' || protocol === 'https:'

const normalizeUrlForHref = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()

    if (!isHttpProtocol(protocol)) return ''

    return parsed.toString()
  } catch {
    return ''
  }
}

const normalizeUrlForDedupe = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()

    if (!isHttpProtocol(protocol)) return ''

    const pathname =
      parsed.pathname.length > 1 ? parsed.pathname.replace(/\/+$/, '') : parsed.pathname

    const hostname = parsed.hostname.toLowerCase()
    const port = parsed.port ? `:${parsed.port}` : ''

    return `${protocol}//${hostname}${port}${pathname}${parsed.search}${parsed.hash}`
  } catch {
    return ''
  }
}

const getIconForLinkKey = (key: string): IconType => {
  if (key === 'x') return 'x'
  if (key === 'discord') return 'discord'
  if (key === 'github') return 'github'
  if (key === 'farcaster') return 'globe'
  if (key === 'docs' || key === 'notion') return 'globe'
  if (key === 'forum' || key === 'discourse') return 'globe'
  if (key === 'website') return 'globe'
  return 'question'
}

export const ExternalLinks: React.FC<ExternalLinksProps> = ({ links }) => {
  const normalizedLinks = React.useMemo(() => {
    const entries = Object.entries(links || {})
    const next: Record<string, string> = {}
    const usedUrls: Record<string, boolean> = {}

    for (let i = entries.length - 1; i >= 0; i -= 1) {
      const [rawKey, rawUrl] = entries[i]
      const key = normalizeLinkKey(rawKey)
      const url = normalizeUrlForHref(rawUrl || '')
      const normalizedUrl = normalizeUrlForDedupe(url)

      if (!key || !url || !normalizedUrl) continue
      if (usedUrls[normalizedUrl]) continue
      if (!next[key]) {
        next[key] = url
        usedUrls[normalizedUrl] = true
      }
    }

    return next
  }, [links])

  return (
    <Flex direction={{ '@initial': 'column', '@768': 'row' }} justify="center">
      {Object.keys(normalizedLinks).length ? (
        <Flex mr={{ '@initial': 'x0', '@768': 'x2' }}>
          {Object.entries(normalizedLinks).map(([key, url]) => (
            <IconAnchor
              href={url}
              name={getIconForLinkKey(key)}
              label={key}
              key={`${key}-${url}`}
            />
          ))}
        </Flex>
      ) : null}
    </Flex>
  )
}
