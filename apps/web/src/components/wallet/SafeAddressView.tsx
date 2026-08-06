'use client'

import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { SAFE_SERVICE_URL } from '@buildeross/constants/safe'
import { CHAIN_ID } from '@buildeross/types'
import { DropdownSelect, FIELD_TYPES, SmartInput } from '@buildeross/ui'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { ChangeEvent, useState } from 'react'
import type { Address } from 'viem'
import { isAddress } from 'viem'

interface SafeAddressViewProps {
  onSubmit: (address: Address, chainId: number) => void
  onBack: () => void
  error?: string
}

// Dynamically build supported chains from SAFE_SERVICE_URL + PUBLIC_DEFAULT_CHAINS
const getSupportedChains = () => {
  return PUBLIC_DEFAULT_CHAINS.filter(
    (chain) => SAFE_SERVICE_URL[chain.id as CHAIN_ID] !== undefined
  ).map((chain) => ({
    value: chain.id as CHAIN_ID,
    label: chain.name,
  }))
}

const SUPPORTED_CHAINS = getSupportedChains()

export function SafeAddressView({ onSubmit, onBack, error }: SafeAddressViewProps) {
  const [address, setAddress] = useState('')
  const [chainId, setChainId] = useState<CHAIN_ID>(CHAIN_ID.ETHEREUM)
  const [validationError, setValidationError] = useState<string>()

  const handleSubmit = () => {
    if (!address) {
      setValidationError('Please enter a Safe address')
      return
    }

    if (!isAddress(address)) {
      setValidationError('Invalid address format')
      return
    }

    setValidationError(undefined)
    onSubmit(address as Address, chainId)
  }

  return (
    <Stack gap="x4" p="x5">
      <Text variant="heading-sm">Connect Safe Wallet</Text>

      <Text variant="paragraph-sm" color="text3">
        Enter your Safe address and select the network
      </Text>

      <Stack gap="x3">
        <DropdownSelect
          id="network"
          value={chainId}
          options={SUPPORTED_CHAINS}
          onChange={(value) => setChainId(value)}
          inputLabel="Network"
          height="x12"
        />

        <SmartInput
          id="safe-address"
          type={FIELD_TYPES.TEXT}
          value={address}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setAddress(e.target.value)
            setValidationError(undefined)
          }}
          inputLabel="Safe Address"
          placeholder="0x..."
          isAddress={true}
          errorMessage={validationError}
        />
      </Stack>

      {error && (
        <Box p="x3" borderRadius="phat" backgroundColor="background2">
          <Text variant="paragraph-sm" color="negative">
            {error}
          </Text>
        </Box>
      )}

      <Flex gap="x3">
        <Button onClick={handleSubmit} style={{ flex: 1 }}>
          Continue
        </Button>
        <Button onClick={onBack} variant="secondary" style={{ flex: 1 }}>
          Back
        </Button>
      </Flex>
    </Stack>
  )
}
