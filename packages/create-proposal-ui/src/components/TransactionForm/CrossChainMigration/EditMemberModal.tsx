import { SmartInput } from '@buildeross/ui/Fields'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import { isAddress } from 'viem'

import { DaoMemberSimplified } from '../../../utils/validateMemberAllocation'

interface EditMemberModalProps {
  open: boolean
  member: DaoMemberSimplified
  memberSnapshot: DaoMemberSimplified[]
  reservedUntilTokenId: bigint
  onSave: (updatedMember: DaoMemberSimplified) => void
  onClose: () => void
}

export const EditMemberModal: React.FC<EditMemberModalProps> = ({
  open,
  member,
  memberSnapshot,
  reservedUntilTokenId,
  onSave,
  onClose,
}) => {
  const [address, setAddress] = useState<string>(member.owner)
  const [tokenIds, setTokenIds] = useState(member.tokens.join(', '))
  const [error, setError] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value as `0x${string}`)
    setError('')

    // Try to resolve ENS
    if (value.endsWith('.eth')) {
      setIsResolving(true)
      try {
        const resolved = await getEnsAddress(value)
        if (resolved) {
          setAddress(resolved)
        }
      } catch (err) {
        console.error('ENS resolution failed:', err)
      } finally {
        setIsResolving(false)
      }
    }
  }

  const handleSave = () => {
    setError('')

    // Validate address
    if (!isAddress(address)) {
      setError('Invalid Ethereum address')
      return
    }

    // Check for duplicate address (excluding current member)
    const existingMember = memberSnapshot.find(
      (m) =>
        m.owner.toLowerCase() === address.toLowerCase() &&
        m.owner.toLowerCase() !== member.owner.toLowerCase()
    )
    if (existingMember) {
      setError('This address already exists in the member list')
      return
    }

    // Parse token IDs
    const idsStr = tokenIds.trim()
    if (!idsStr) {
      setError('Please enter at least one token ID')
      return
    }

    let parsedIds: number[] = []
    try {
      parsedIds = idsStr.split(',').map((id) => {
        const parsed = parseInt(id.trim())
        if (isNaN(parsed)) {
          throw new Error(`Invalid token ID: ${id}`)
        }
        return parsed
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid token IDs format')
      return
    }

    // Validate token IDs are within range
    const reserved = Number(reservedUntilTokenId)
    for (const id of parsedIds) {
      if (id < 0 || id >= reserved) {
        setError(`Token ID ${id} is outside reserved range (0-${reserved - 1})`)
        return
      }
    }

    // Check if any token is already allocated to a different member
    const allocated = memberSnapshot
      .filter((m) => m.owner.toLowerCase() !== member.owner.toLowerCase())
      .flatMap((m) => m.tokens)

    for (const id of parsedIds) {
      if (allocated.includes(id)) {
        setError(`Token ID ${id} is already allocated to another address`)
        return
      }
    }

    // Create updated member
    const updatedMember: DaoMemberSimplified = {
      owner: address as `0x${string}`,
      ownerAlias: address as `0x${string}`,
      tokens: parsedIds,
    }

    onSave(updatedMember)
    onClose()
  }

  return (
    <AnimatedModal close={onClose} open={open}>
      <Flex direction="column" gap="x4" p="x6" minWidth="500px">
        <Heading size="md">Edit Member</Heading>

        <Stack gap="x4">
          {/* Address Input */}
          <Box>
            <SmartInput
              id="edit-member-address"
              inputLabel="Address"
              type="text"
              isAddress={true}
              onChange={handleAddressChange}
              value={address}
              placeholder="0x... or vitalik.eth"
            />
            {isResolving && (
              <Text color="text3" mt="x1">
                Resolving ENS...
              </Text>
            )}
          </Box>

          {/* Token IDs Input */}
          <Box>
            <Label htmlFor="edit-token-ids" mb="x2">
              Token IDs (comma-separated)
            </Label>
            <Box
              as="input"
              id="edit-token-ids"
              type="text"
              value={tokenIds}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTokenIds(e.target.value)
              }
              placeholder="e.g., 5,6,7"
              p="x3"
              borderRadius="curved"
              borderWidth="thin"
              borderStyle="solid"
              borderColor="border"
              backgroundColor="background1"
              color="text1"
              width="100%"
            />
            <Text color="text3" mt="x1" fontSize={12}>
              Reserved range: 0 - {Number(reservedUntilTokenId) - 1}
            </Text>
          </Box>

          {/* Error Message */}
          {error && (
            <Box p="x3" borderRadius="curved" backgroundColor="negative">
              <Text color="onNegative">{error}</Text>
            </Box>
          )}

          {/* Actions */}
          <Flex justify="flex-end" gap="x3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isResolving}>
              Save Changes
            </Button>
          </Flex>
        </Stack>
      </Flex>
    </AnimatedModal>
  )
}
