import { SmartInput } from '@buildeross/ui/Fields'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import { isAddress } from 'viem'

import {
  autoAssignTokenIds,
  DaoMemberSimplified,
  getUnallocatedTokenIds,
} from '../../../utils/validateMemberAllocation'

interface AddMemberModalProps {
  open: boolean
  memberSnapshot: DaoMemberSimplified[]
  reservedUntilTokenId: bigint
  onAdd: (member: DaoMemberSimplified) => void
  onClose: () => void
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  open,
  memberSnapshot,
  reservedUntilTokenId,
  onAdd,
  onClose,
}) => {
  const [address, setAddress] = useState('')
  const [assignmentMode, setAssignmentMode] = useState<'manual' | 'auto'>('auto')
  const [manualTokenIds, setManualTokenIds] = useState('')
  const [autoCount, setAutoCount] = useState('1')
  const [error, setError] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const unallocatedIds = getUnallocatedTokenIds(memberSnapshot, reservedUntilTokenId)

  const handleAddressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAddress(value)
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

  const handleAdd = () => {
    setError('')

    // Validate address
    if (!isAddress(address)) {
      setError('Invalid Ethereum address')
      return
    }

    // Check for duplicate address
    const existingMember = memberSnapshot.find(
      (m) => m.owner.toLowerCase() === address.toLowerCase()
    )
    if (existingMember) {
      setError('This address already exists in the member list')
      return
    }

    let tokenIds: number[] = []

    if (assignmentMode === 'manual') {
      // Parse manual token IDs
      const idsStr = manualTokenIds.trim()
      if (!idsStr) {
        setError('Please enter token IDs')
        return
      }

      try {
        tokenIds = idsStr.split(',').map((id) => {
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
      for (const id of tokenIds) {
        if (id < 0 || id >= reserved) {
          setError(`Token ID ${id} is outside reserved range (0-${reserved - 1})`)
          return
        }
      }

      // Check if any token is already allocated
      const allocated = memberSnapshot.flatMap((m) => m.tokens)
      for (const id of tokenIds) {
        if (allocated.includes(id)) {
          setError(`Token ID ${id} is already allocated to another address`)
          return
        }
      }
    } else {
      // Auto-assign
      const count = parseInt(autoCount)
      if (isNaN(count) || count < 1) {
        setError('Please enter a valid count (minimum 1)')
        return
      }

      if (count > unallocatedIds.length) {
        setError(
          `Not enough unallocated tokens. Only ${unallocatedIds.length} tokens available.`
        )
        return
      }

      tokenIds = autoAssignTokenIds(memberSnapshot, reservedUntilTokenId, count)
    }

    // Create new member
    const newMember: DaoMemberSimplified = {
      owner: address as `0x${string}`,
      ownerAlias: address as `0x${string}`, // For L2→L2, same as owner
      tokens: tokenIds,
    }

    onAdd(newMember)
    onClose()
  }

  return (
    <AnimatedModal close={onClose} open={open}>
      <Flex direction="column" gap="x4" p="x6" minWidth="500px">
        <Heading size="md">Add New Member</Heading>

        <Stack gap="x4">
          {/* Address Input */}
          <Box>
            <SmartInput
              id="member-address"
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

          {/* Assignment Mode */}
          <Box>
            <Label mb="x2">Token Assignment</Label>
            <Flex gap="x4">
              <Flex as="label" align="center" cursor="pointer">
                <Box
                  as="input"
                  type="radio"
                  value="auto"
                  checked={assignmentMode === 'auto'}
                  onChange={() => setAssignmentMode('auto')}
                  mr="x2"
                />
                <Text>Auto-assign</Text>
              </Flex>
              <Flex as="label" align="center" cursor="pointer">
                <Box
                  as="input"
                  type="radio"
                  value="manual"
                  checked={assignmentMode === 'manual'}
                  onChange={() => setAssignmentMode('manual')}
                  mr="x2"
                />
                <Text>Manual</Text>
              </Flex>
            </Flex>
          </Box>

          {/* Auto-assign Options */}
          {assignmentMode === 'auto' && (
            <Box>
              <Text color="text3" mb="x2">
                Available unallocated tokens: {unallocatedIds.length}
              </Text>
              <Label htmlFor="token-count" mb="x2">
                Number of tokens to assign
              </Label>
              <Box
                as="input"
                id="token-count"
                type="number"
                min="1"
                max={unallocatedIds.length}
                value={autoCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAutoCount(e.target.value)
                }
                p="x3"
                borderRadius="curved"
                borderWidth="thin"
                borderStyle="solid"
                borderColor="border"
                backgroundColor="background1"
                color="text1"
                width="100%"
              />
            </Box>
          )}

          {/* Manual Options */}
          {assignmentMode === 'manual' && (
            <Box>
              <Text color="text3" mb="x2">
                Enter comma-separated token IDs (e.g., 5,6,7)
                <br />
                Available: {unallocatedIds.slice(0, 20).join(', ')}
                {unallocatedIds.length > 20 && ` ... (${unallocatedIds.length} total)`}
              </Text>
              <Label htmlFor="token-ids" mb="x2">
                Token IDs
              </Label>
              <Box
                as="input"
                id="token-ids"
                type="text"
                value={manualTokenIds}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setManualTokenIds(e.target.value)
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
            </Box>
          )}

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
            <Button onClick={handleAdd} disabled={isResolving}>
              Add Member
            </Button>
          </Flex>
        </Stack>
      </Flex>
    </AnimatedModal>
  )
}
