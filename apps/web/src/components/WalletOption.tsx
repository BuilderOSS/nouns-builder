'use client'

import { Box, Flex, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

import { AsyncImage } from './AsyncImage'

interface WalletOptionProps {
  name: string
  icon: string
  iconBackground: string
  onClick: () => void
  recent?: boolean
  disabled?: boolean
}

export function WalletOption({
  name,
  icon,
  iconBackground,
  onClick,
  recent = false,
  disabled = false,
}: WalletOptionProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Box
      as="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      w="100%"
      p="x2"
      borderRadius="curved"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      backgroundColor={isHovered && !disabled ? 'background2' : 'transparent'}
      style={{
        border: 'none',
        outline: 'none',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'left',
      }}
    >
      <Flex align="center" gap="x3" justify="space-between">
        <Flex align="center" gap="x2">
          <AsyncImage
            src={icon}
            width={28}
            height={28}
            background={iconBackground}
            borderRadius="6px"
          />
          <Stack gap="x0">
            <Text
              variant="paragraph-md"
              color="text1"
              style={{ fontWeight: 600, lineHeight: 1.2 }}
            >
              {name}
            </Text>
            {recent && (
              <Text
                variant="paragraph-xs"
                color="text3"
                style={{ lineHeight: 1, marginTop: -2 }}
              >
                Recent
              </Text>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  )
}
