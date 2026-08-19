import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex, Heading, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

export interface OverwriteDraftModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  draftTitle?: string
}

export const OverwriteDraftModal: React.FC<OverwriteDraftModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  draftTitle,
}) => {
  return (
    <AnimatedModal open={isOpen} close={onClose} size="medium">
      <Stack gap="x6" p="x6">
        <Flex justify="space-between" align="center">
          <Heading size="sm">Overwrite Existing Draft?</Heading>
          <Button variant="ghost" size="sm" onClick={onClose} style={{ padding: '8px' }}>
            <Icon id="cross" />
          </Button>
        </Flex>

        <Stack gap="x4">
          <Flex direction="column" gap="x2">
            <Icon id="warning" size="lg" fill="warning" />
            <Text variant="paragraph-md" color="text3">
              You have an existing proposal draft that will be overwritten:
            </Text>
            {draftTitle && (
              <Text variant="paragraph-md" fontWeight="label" color="text1">
                "{draftTitle}"
              </Text>
            )}
          </Flex>

          <Text variant="paragraph-md" color="text3">
            Loading this proposal for update will replace your current draft. This action
            cannot be undone.
          </Text>
        </Stack>

        <Stack gap="x3">
          <Button variant="primary" onClick={onConfirm} width="100%">
            Yes, Overwrite Draft
          </Button>

          <Button variant="secondary" onClick={onClose} width="100%">
            Cancel
          </Button>
        </Stack>
      </Stack>
    </AnimatedModal>
  )
}
