import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

import {
  DaoMemberSimplified,
  validateMemberAllocation,
} from '../../../utils/validateMemberAllocation'
import { AddMemberModal } from './AddMemberModal'
import { EditMemberModal } from './EditMemberModal'
import { MemberAllocationSummary } from './MemberAllocationSummary'

interface MemberListEditorProps {
  initialMembers: DaoMemberSimplified[]
  reservedUntilTokenId: bigint
  onContinue: (members: DaoMemberSimplified[]) => void
  onSkip: () => void
}

export const MemberListEditor: React.FC<MemberListEditorProps> = ({
  initialMembers,
  reservedUntilTokenId,
  onContinue,
  onSkip,
}) => {
  const [editedMembers, setEditedMembers] =
    useState<DaoMemberSimplified[]>(initialMembers)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMemberIndex, setEditingMemberIndex] = useState<number>(-1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number>(-1)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const validation = validateMemberAllocation(editedMembers, reservedUntilTokenId)

  const handleAddMember = (newMember: DaoMemberSimplified) => {
    setEditedMembers([...editedMembers, newMember])
    setShowAddModal(false)
  }

  const handleEditMember = (updatedMember: DaoMemberSimplified) => {
    const updated = [...editedMembers]
    updated[editingMemberIndex] = updatedMember
    setEditedMembers(updated)
    setShowEditModal(false)
    setEditingMemberIndex(-1)
  }

  const handleRemoveMember = (index: number) => {
    const updated = editedMembers.filter((_, i) => i !== index)
    setEditedMembers(updated)
    setShowDeleteConfirm(-1)
  }

  const handleResetToDefault = () => {
    setEditedMembers(initialMembers)
    setShowResetConfirm(false)
  }

  const handleContinue = () => {
    if (!validation.isValid) {
      return
    }
    onContinue(editedMembers)
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const truncateTokens = (tokens: number[]) => {
    if (tokens.length <= 5) {
      return tokens.join(', ')
    }
    return `${tokens.slice(0, 5).join(', ')} ... (+${tokens.length - 5} more)`
  }

  // Member row component with ENS display
  const MemberRow = ({
    member,
    index,
  }: {
    member: DaoMemberSimplified
    index: number
  }) => {
    const { displayName, ensName, isLoading } = useEnsData(member.owner)

    return (
      <Box
        key={`${member.owner}-${index}`}
        p="x3"
        borderRadius="curved"
        backgroundColor="background1"
      >
        {showDeleteConfirm === index ? (
          <Flex direction="column" gap="x2">
            <Text color="negative" fontSize={14}>
              Remove this member? This cannot be undone.
            </Text>
            <Flex gap="x2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(-1)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                color="negative"
                onClick={() => handleRemoveMember(index)}
              >
                Remove
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex justify="space-between" align="center">
            <Stack gap="x1">
              <Flex align="center" gap="x2">
                <Text fontWeight="label">{isLoading ? 'Loading...' : displayName}</Text>
                {ensName && !isLoading && (
                  <Text fontSize={12} color="text3" fontFamily="mono">
                    ({truncateAddress(member.owner)})
                  </Text>
                )}
              </Flex>
              <Text fontSize={12} color="text3">
                {member.tokens.length} token{member.tokens.length !== 1 ? 's' : ''}:{' '}
                {truncateTokens(member.tokens)}
              </Text>
            </Stack>
            <Flex gap="x2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingMemberIndex(index)
                  setShowEditModal(true)
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                color="negative"
                onClick={() => setShowDeleteConfirm(index)}
              >
                Remove
              </Button>
            </Flex>
          </Flex>
        )}
      </Box>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Edit Members
        </Heading>
        <Text color="text3">
          Review and edit member allocations before setting merkle roots on-chain.
        </Text>
      </Box>

      {/* Allocation Summary */}
      <MemberAllocationSummary validation={validation} />

      {/* Action Buttons */}
      {showResetConfirm ? (
        <Box p="x4" borderRadius="curved" backgroundColor="warning">
          <Flex direction="column" gap="x3">
            <Text color="onWarning">
              Are you sure you want to reset all changes? This will restore the original
              member list and cannot be undone.
            </Text>
            <Flex gap="x3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleResetToDefault}>
                Reset to Default
              </Button>
            </Flex>
          </Flex>
        </Box>
      ) : (
        <Flex justify="space-between" align="center">
          <Flex gap="x3">
            <Button variant="secondary" onClick={() => setShowAddModal(true)}>
              Add Member
            </Button>
            <Button variant="ghost" onClick={() => setShowResetConfirm(true)}>
              Reset to Default
            </Button>
          </Flex>
          <Text color="text3" fontSize={14}>
            {editedMembers.length} member{editedMembers.length !== 1 ? 's' : ''}
          </Text>
        </Flex>
      )}

      {/* Member List */}
      <Box
        p="x4"
        borderRadius="curved"
        backgroundColor="background2"
        maxHeight="400px"
        overflowY="auto"
      >
        <Stack gap="x3">
          {editedMembers.length === 0 ? (
            <Text color="text3" textAlign="center">
              No members added yet. Click "Add Member" to get started.
            </Text>
          ) : (
            editedMembers.map((member, index) => (
              <MemberRow key={`${member.owner}-${index}`} member={member} index={index} />
            ))
          )}
        </Stack>
      </Box>

      {/* Validation Errors */}
      {!validation.isValid && validation.errors.length > 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="negative">
          <Heading size="xs" color="onNegative" mb="x2">
            Validation Errors
          </Heading>
          <Stack gap="x1">
            {validation.errors.map((error, idx) => (
              <Text key={idx} color="onNegative" fontSize={14}>
                • {error}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      {/* Navigation */}
      <Flex justify="space-between">
        <Button variant="secondary" onClick={onSkip}>
          Skip Editing
        </Button>
        <Button onClick={handleContinue} disabled={!validation.isValid}>
          Continue to Set Roots
        </Button>
      </Flex>

      {/* Modals */}
      <AddMemberModal
        open={showAddModal}
        memberSnapshot={editedMembers}
        reservedUntilTokenId={reservedUntilTokenId}
        onAdd={handleAddMember}
        onClose={() => setShowAddModal(false)}
      />

      {editingMemberIndex >= 0 && (
        <EditMemberModal
          open={showEditModal}
          member={editedMembers[editingMemberIndex]}
          memberSnapshot={editedMembers}
          reservedUntilTokenId={reservedUntilTokenId}
          onSave={handleEditMember}
          onClose={() => {
            setShowEditModal(false)
            setEditingMemberIndex(-1)
          }}
        />
      )}
    </Stack>
  )
}
