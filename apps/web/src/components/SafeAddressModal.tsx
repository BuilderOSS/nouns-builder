'use client'

import { CHAIN_ID } from '@buildeross/types'
import { DropdownSelect, FIELD_TYPES, SmartInput } from '@buildeross/ui'
import { Button, Flex, Stack, Text } from '@buildeross/zord'
import { ChangeEvent, useState } from 'react'
import type { Address } from 'viem'
import { isAddress } from 'viem'

interface SafeAddressModalProps {
  onSubmit: (safeAddress: Address, chainId: CHAIN_ID) => Promise<void>
  onCancel: () => void
  isValidating?: boolean
  error?: string | null
  initialSafeAddress?: Address
  initialChainId?: CHAIN_ID
}

const SUPPORTED_CHAINS = [
  { value: CHAIN_ID.ETHEREUM, label: 'Ethereum' },
  { value: CHAIN_ID.OPTIMISM, label: 'Optimism' },
  { value: CHAIN_ID.BASE, label: 'Base' },
  { value: CHAIN_ID.SEPOLIA, label: 'Sepolia' },
  { value: CHAIN_ID.BASE_SEPOLIA, label: 'Base Sepolia' },
]

export function SafeAddressModal({
  onSubmit,
  onCancel,
  isValidating = false,
  error,
  initialSafeAddress,
  initialChainId,
}: SafeAddressModalProps) {
  const [safeAddress, setSafeAddress] = useState<string>(initialSafeAddress || '')
  const [chainId, setChainId] = useState<CHAIN_ID>(initialChainId || CHAIN_ID.ETHEREUM)
  const [inputError, setInputError] = useState<string | null>(null)

  const handleSubmit = async () => {
    // Validate address
    if (!safeAddress) {
      setInputError('Please enter a Safe address')
      return
    }

    if (!isAddress(safeAddress)) {
      setInputError('Invalid Ethereum address')
      return
    }

    setInputError(null)
    await onSubmit(safeAddress as Address, chainId)
  }

  return (
    <Flex
      direction="column"
      gap="x4"
      p="x5"
      backgroundColor="background1"
      borderRadius="curved"
      style={{ width: '90vw', maxWidth: '380px' }}
    >
      <Stack gap="x2">
        <Text variant="label-lg">Connect as Safe Owner</Text>
        <Text variant="paragraph-sm" color="text3">
          Select the network and enter the Safe address. You'll need to connect with a
          wallet that is one of the owners of this Safe.
        </Text>
      </Stack>

      <Stack gap="x2">
        <DropdownSelect
          id="network"
          value={chainId}
          options={SUPPORTED_CHAINS}
          onChange={(value) => setChainId(value)}
          inputLabel="Network"
          disabled={isValidating}
          height="x12"
        />

        <SmartInput
          id="safe-address"
          type={FIELD_TYPES.TEXT}
          value={safeAddress}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSafeAddress(e.target.value)
            setInputError(null)
          }}
          inputLabel="Safe Address"
          placeholder="0x..."
          disabled={isValidating}
          isAddress={true}
          errorMessage={inputError}
        />

        {error && (
          <Stack
            p="x3"
            borderRadius="curved"
            style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
          >
            <Text variant="paragraph-sm" color="negative">
              {error}
            </Text>
          </Stack>
        )}
      </Stack>

      <Stack gap="x2">
        <Button onClick={handleSubmit} disabled={isValidating} w="100%" variant="primary">
          {isValidating ? 'Validating...' : 'Continue'}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={isValidating} w="100%">
          Cancel
        </Button>
      </Stack>
    </Flex>
  )
}
