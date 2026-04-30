import { DecodedArg } from '@buildeross/types'
import { Box, Flex, Icon, IconType, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { MarkdownDisplay } from '../../MarkdownDisplay/MarkdownDisplay'
import { BaseArgumentDisplay } from './BaseArgumentDisplay'
import { markdownContent } from './UpdateDescriptionArgumentDisplay.css'

interface UpdateDescriptionArgumentDisplayProps {
  arg: DecodedArg
}

const normalizeLinkKey = (key: string): string => {
  const normalized = key.trim().toLowerCase()
  return normalized === 'twitter' ? 'x' : normalized
}

const getIconForLinkKey = (key: string): IconType => {
  if (key === 'x') return 'twitter'
  if (key === 'discord') return 'discord'
  if (key === 'github') return 'github'
  if (key === 'farcaster') return 'globe'
  if (key === 'docs' || key === 'notion') return 'globe'
  if (key === 'forum' || key === 'discourse') return 'globe'
  if (key === 'website') return 'globe'
  return 'question'
}

const normalizeHref = (url: string): string => {
  const trimmed = url.trim()
  if (!trimmed) return ''

  try {
    const parsed = new URL(trimmed)
    const protocol = parsed.protocol.toLowerCase()

    if (protocol !== 'http:' && protocol !== 'https:') return ''

    return parsed.toString()
  } catch {
    return ''
  }
}

const unescapeDescription = (raw: string): string => {
  let output = ''

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]

    if (char !== '\\' || i + 1 >= raw.length) {
      output += char
      continue
    }

    const next = raw[i + 1]
    if (next === 'n') {
      output += '\n'
      i += 1
      continue
    }
    if (next === 'r') {
      output += '\r'
      i += 1
      continue
    }
    if (next === 't') {
      output += '\t'
      i += 1
      continue
    }
    if (next === '"' || next === '\\') {
      output += next
      i += 1
      continue
    }

    output += char
  }

  return output
}

const parseDaoMetadataString = (
  raw: string | undefined
): { description: string; links: Record<string, string> } => {
  if (!raw) return { description: '', links: {} }

  const normalizedRaw = unescapeDescription(raw)
  if (!normalizedRaw.startsWith('---\n')) return { description: normalizedRaw, links: {} }

  const frontmatterEnd = normalizedRaw.indexOf('\n---\n')
  if (frontmatterEnd === -1) return { description: normalizedRaw, links: {} }

  const frontmatterBody = normalizedRaw.slice(4, frontmatterEnd)
  const descriptionWithOptionalSpacer = normalizedRaw.slice(frontmatterEnd + 5)
  const description = descriptionWithOptionalSpacer.startsWith('\n')
    ? descriptionWithOptionalSpacer.slice(1)
    : descriptionWithOptionalSpacer

  const links: Record<string, string> = {}
  let inLinksSection = false

  for (const line of frontmatterBody.split('\n')) {
    if (!line.trim()) continue

    const indentation = line.length - line.trimStart().length
    if (indentation === 0) {
      inLinksSection = line.trim() === 'links:'
      continue
    }
    if (!inLinksSection) continue

    const separatorIndex = line.indexOf(':')
    if (separatorIndex <= indentation) continue

    const key = normalizeLinkKey(line.slice(indentation, separatorIndex).trim())
    const href = normalizeHref(line.slice(separatorIndex + 1).trim())
    if (!key || !href) continue
    links[key] = href
  }

  return { description, links }
}

export const UpdateDescriptionArgumentDisplay: React.FC<
  UpdateDescriptionArgumentDisplayProps
> = ({ arg }) => {
  if (typeof arg.value !== 'string') {
    return <BaseArgumentDisplay name={arg.name} value={arg.value} />
  }

  const parsed = parseDaoMetadataString(arg.value)
  const parsedDescription = parsed.description.trim()
  const parsedLinks = Object.entries(parsed.links)
    .map(([key, value]) => {
      const normalizedKey = normalizeLinkKey(key)
      const href = normalizeHref(value)

      if (!normalizedKey || !href) return null
      return { key: normalizedKey, href }
    })
    .filter((value): value is { key: string; href: string } => Boolean(value))

  if (!parsedDescription && !parsedLinks.length) {
    return <BaseArgumentDisplay name={arg.name} value={arg.value} />
  }

  return (
    <Stack gap="x2" w="100%">
      <Flex align="flex-start" w="100%">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {arg.name}:
        </Text>
      </Flex>

      {parsedLinks.length > 0 ? (
        <Stack pl="x4" gap="x1">
          <Text variant="label-sm" color="text3">
            Links
          </Text>
          {parsedLinks.map((link) => (
            <Flex key={`${link.key}-${link.href}`} align="center" gap="x2" wrap="wrap">
              <Icon id={getIconForLinkKey(link.key)} />
              <Text>{link.key}:</Text>
              <Text
                as="a"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ overflowWrap: 'anywhere' }}
              >
                {link.href}
              </Text>
            </Flex>
          ))}
        </Stack>
      ) : null}

      {parsedDescription ? (
        <Stack pl="x4" gap="x1">
          <Text variant="label-sm" color="text3">
            Description
          </Text>
          <Box
            p="x3"
            borderStyle="solid"
            borderWidth="normal"
            borderColor="border"
            borderRadius="curved"
            style={{ maxHeight: '220px', overflowY: 'auto' }}
          >
            <Box className={markdownContent}>
              <MarkdownDisplay>{parsedDescription}</MarkdownDisplay>
            </Box>
          </Box>
        </Stack>
      ) : null}
    </Stack>
  )
}
