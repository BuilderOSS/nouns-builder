import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

export interface ModalHeaderProps {
  daoName: string
  daoImage: string
  title: string
  subtitle?: string
  onClose: () => void
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  daoName,
  daoImage,
  title,
  subtitle,
  onClose,
}) => {
  return (
    <Box w="100%" mb="x4">
      {/* DAO identity row */}
      <Flex align="center" gap="x2" mb="x3">
        <Flex
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <FallbackImage
            src={daoImage}
            alt={daoName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Flex>
        <Text variant="paragraph-sm" color="text3" style={{ flexGrow: 1 }}>
          {daoName}
        </Text>
        <Button
          variant="ghost"
          onClick={onClose}
          p={'x0'}
          size="xs"
          style={{ padding: 0, flexShrink: 0 }}
        >
          <Icon id="cross" />
        </Button>
      </Flex>

      {/* Title */}
      <Text variant="heading-md">{title}</Text>

      {/* Subtitle / detail */}
      {subtitle && (
        <Text variant="paragraph-sm" color="tertiary" mt="x2">
          {subtitle}
        </Text>
      )}
    </Box>
  )
}
