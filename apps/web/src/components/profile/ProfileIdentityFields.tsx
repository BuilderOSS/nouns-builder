import { Box, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'
import type { ProfileIdentity } from 'src/utils/profileIdentity'

type ProfileIdentityFieldsProps = {
  identity?: ProfileIdentity
}

export const ProfileIdentityFields: React.FC<ProfileIdentityFieldsProps> = ({
  identity,
}) => {
  if (!identity?.bio && !identity?.website && !identity?.x && !identity?.farcaster)
    return null

  return (
    <Flex mt="x4" direction="column" gap="x3" align="flex-start">
      {identity.bio ? (
        <Text
          color="text2"
          style={{
            lineHeight: 1.5,
            maxWidth: '320px',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word',
          }}
        >
          {identity.bio}
        </Text>
      ) : null}

      {(identity.website || identity.x || identity.farcaster) && (
        <Flex gap="x2" wrap>
          {identity.website ? (
            <Box
              as="a"
              href={identity.website.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${identity.website.label}`}
              color="text2"
              style={{ textDecoration: 'none' }}
            >
              <Flex align="center" gap="x1">
                <Icon id="globe" size="sm" />
                <Text>{identity.website.label}</Text>
              </Flex>
            </Box>
          ) : null}

          {identity.x ? (
            <Box
              as="a"
              href={identity.x.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${identity.x.label} on X`}
              color="text2"
              style={{ textDecoration: 'none' }}
            >
              <Flex align="center" gap="x1">
                <Icon id="x" size="sm" />
                <Text>{identity.x.label}</Text>
              </Flex>
            </Box>
          ) : null}

          {identity.farcaster ? (
            <Box
              as="a"
              href={identity.farcaster.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${identity.farcaster.label} on Farcaster`}
              color="text2"
              style={{ textDecoration: 'none' }}
            >
              <Flex align="center" gap="x1">
                <Icon id="external-16" size="sm" />
                <Text>{identity.farcaster.label}</Text>
              </Flex>
            </Box>
          ) : null}
        </Flex>
      )}
    </Flex>
  )
}
