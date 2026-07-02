import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

import {
  DaoMemberSimplified,
  validateMemberAllocation,
} from '../../../utils/validateMemberAllocation'
import { AddMemberModal } from './AddMemberModal'
import { EditAttributesModal } from './EditAttributesModal'
import { EditMemberModal } from './EditMemberModal'
import { MemberAllocationSummary } from './MemberAllocationSummary'

interface MemberListEditorProps {
  initialMembers: DaoMemberSimplified[]
  initialAttributes: number[][]
  reservedUntilTokenId: bigint
  onContinue: (members: DaoMemberSimplified[], attributes: number[][]) => void
  onSkip: () => void
}

export const MemberListEditor: React.FC<MemberListEditorProps> = ({
  initialMembers,
  initialAttributes,
  reservedUntilTokenId,
  onContinue,
  onSkip,
}) => {
  const [editedMembers, setEditedMembers] =
    useState<DaoMemberSimplified[]>(initialMembers)
  const [editedAttributes, setEditedAttributes] = useState<number[][]>(initialAttributes)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAttributesModal, setShowAttributesModal] = useState(false)
  const [editingMemberIndex, setEditingMemberIndex] = useState<number>(-1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number>(-1)
  const [editingTokenIds, setEditingTokenIds] = useState<number[]>([])

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

  const handleEditAttributes = (tokenId: number, newAttributes: number[]) => {
    const updated = [...editedAttributes]
    updated[tokenId] = newAttributes
    setEditedAttributes(updated)
  }

  const handleOpenAttributesModal = () => {
    // For simplicity, allow editing all tokens in the first member, or all allocated tokens
    const allAllocatedTokenIds = editedMembers
      .flatMap((m) => m.tokens)
      .sort((a, b) => a - b)
    setEditingTokenIds(allAllocatedTokenIds)
    setShowAttributesModal(true)
  }

  const handleContinue = () => {
    if (!validation.isValid) {
      return
    }
    onContinue(editedMembers, editedAttributes)
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

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Edit Members & Attributes
        </Heading>
        <Text color="text3">
          Review and edit member allocations and token attributes before setting merkle
          roots on-chain.
        </Text>
      </Box>

      {/* Allocation Summary */}
      <MemberAllocationSummary validation={validation} />

      {/* Action Buttons */}
      <Flex justify="space-between" align="center">
        <Flex gap="x3">
          <Button variant="secondary" onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
          <Button variant="secondary" onClick={handleOpenAttributesModal}>
            Edit Attributes
          </Button>
        </Flex>
        <Text color="text3" fontSize={14}>
          {editedMembers.length} member{editedMembers.length !== 1 ? 's' : ''}
        </Text>
      </Flex>

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
                      <Text fontWeight="label">{truncateAddress(member.owner)}</Text>
                      <Text fontSize={12} color="text3">
                        {member.tokens.length} token
                        {member.tokens.length !== 1 ? 's' : ''}:{' '}
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

      {showEditModal && editingMemberIndex >= 0 && (
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

      <EditAttributesModal
        open={showAttributesModal}
        tokenIds={editingTokenIds}
        currentAttributes={editedAttributes}
        onSave={handleEditAttributes}
        onClose={() => setShowAttributesModal(false)}
      />
    </Stack>
  )
}
