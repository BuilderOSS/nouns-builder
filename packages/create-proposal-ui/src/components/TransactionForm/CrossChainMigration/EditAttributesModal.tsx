import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

interface EditAttributesModalProps {
  open: boolean
  tokenIds: number[]
  currentAttributes: number[][] // attributesData indexed by tokenId
  onSave: (tokenId: number, newAttributes: number[]) => void
  onClose: () => void
}

export const EditAttributesModal: React.FC<EditAttributesModalProps> = ({
  open,
  tokenIds,
  currentAttributes,
  onSave,
  onClose,
}) => {
  const [understood, setUnderstood] = useState(false)
  const [editedAttributes, setEditedAttributes] = useState<Record<number, number[]>>({})

  const handleAttributeChange = (tokenId: number, attrIndex: number, value: string) => {
    const parsed = parseInt(value)
    if (isNaN(parsed) || parsed < 0 || parsed > 65535) return

    const current =
      editedAttributes[tokenId] || currentAttributes[tokenId] || Array(16).fill(0)
    const updated = [...current]
    updated[attrIndex] = parsed

    setEditedAttributes({
      ...editedAttributes,
      [tokenId]: updated,
    })
  }

  const handleSaveAll = () => {
    if (!understood) return

    Object.entries(editedAttributes).forEach(([tokenIdStr, attrs]) => {
      const tokenId = parseInt(tokenIdStr)
      onSave(tokenId, attrs)
    })

    onClose()
  }

  return (
    <AnimatedModal close={onClose} open={open}>
      <Flex
        direction="column"
        gap="x4"
        p="x6"
        style={{ minWidth: 600, maxHeight: '80vh', overflow: 'auto' }}
      >
        <Heading size="md">Edit Token Attributes</Heading>

        {/* Strong Warning */}
        <Box p="x4" borderRadius="curved" backgroundColor="warning">
          <Heading size="xs" color="onWarning" mb="x2">
            ⚠️ WARNING: Changing Token Artwork
          </Heading>
          <Text color="onWarning" mb="x3">
            Modifying attributes will change how these tokens appear visually. This
            affects the artwork/metadata permanently. Only proceed if you understand the
            consequences.
          </Text>
          <Flex as="label" align="center" style={{ cursor: 'pointer' }}>
            <Box
              as="input"
              type="checkbox"
              checked={understood}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setUnderstood(e.target.checked)
              }
              mr="x2"
            />
            <Text color="onWarning" fontWeight="label">
              I understand this changes token artwork
            </Text>
          </Flex>
        </Box>

        {/* Token Attributes Editing */}
        <Stack gap="x4">
          {tokenIds.map((tokenId) => {
            const attrs =
              editedAttributes[tokenId] || currentAttributes[tokenId] || Array(16).fill(0)

            return (
              <Box
                key={tokenId}
                p="x4"
                borderRadius="curved"
                backgroundColor="background2"
              >
                <Heading size="xs" mb="x3">
                  Token #{tokenId}
                </Heading>
                <Box
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 12,
                  }}
                >
                  {attrs.map((value, idx) => (
                    <Box key={idx}>
                      <Label htmlFor={`token-${tokenId}-attr-${idx}`} mb="x1">
                        Attr {idx}
                      </Label>
                      <Box
                        as="input"
                        id={`token-${tokenId}-attr-${idx}`}
                        type="number"
                        min="0"
                        max="65535"
                        value={value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleAttributeChange(tokenId, idx, e.target.value)
                        }
                        disabled={!understood}
                        p="x2"
                        borderRadius="curved"
                        borderWidth="thin"
                        borderStyle="solid"
                        borderColor="border"
                        backgroundColor="background1"
                        color="text1"
                        style={{ width: '100%' }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )
          })}
        </Stack>

        {/* Actions */}
        <Flex justify="flex-end" gap="x3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveAll} disabled={!understood}>
            Save Changes
          </Button>
        </Flex>
      </Flex>
    </AnimatedModal>
  )
}
