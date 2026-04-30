import { DecodedArg } from '@buildeross/types'
import {
  mapDaoLinkKeyToIcon,
  parseDaoMetadataString,
  toDisplayDaoLinks,
} from '@buildeross/utils'
import { Box, Flex, Icon, IconType, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { MarkdownDisplay } from '../../MarkdownDisplay/MarkdownDisplay'
import { BaseArgumentDisplay } from './BaseArgumentDisplay'
import {
  markdownBoxHeight,
  markdownContent,
} from './UpdateDescriptionArgumentDisplay.css'

interface UpdateDescriptionArgumentDisplayProps {
  arg: DecodedArg
}

export const UpdateDescriptionArgumentDisplay: React.FC<
  UpdateDescriptionArgumentDisplayProps
> = ({ arg }) => {
  if (typeof arg.value !== 'string') {
    return <BaseArgumentDisplay name={arg.name} value={arg.value} />
  }

  const parsed = parseDaoMetadataString(arg.value)
  const parsedDescription = parsed.description.trim()
  const parsedLinks = toDisplayDaoLinks(parsed.links)

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
              <Icon id={mapDaoLinkKeyToIcon(link.key) as IconType} />
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
            className={markdownBoxHeight}
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
