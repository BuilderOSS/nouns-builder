import { ERC721_REDEEM_MINTER } from '@buildeross/constants'
import { erc721RedeemMinterAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'
import { formatEther, isAddressEqual, zeroAddress } from 'viem'
import { useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { adminSection } from '../../styles/Section.css'
import { Section } from '../AdminForm/Section'
import {
  settingsCard,
  settingsLabel,
  settingsRow,
  settingsValue,
} from './ERC721RedeemMinterForm.css'
import { MintingForm } from './MintingForm'
import { SettingsForm } from './SettingsForm'

export const ERC721RedeemMinterForm: React.FC = () => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const config = useConfig()
  const [isEditing, setIsEditing] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const minterAddress = ERC721_REDEEM_MINTER[chain.id]

  const {
    data: settingsData,
    refetch,
    isLoading,
  } = useReadContract({
    abi: erc721RedeemMinterAbi,
    address: minterAddress as AddressType,
    functionName: 'redeemSettings',
    args: [addresses.token!],
    chainId: chain.id,
  } as const)

  const [mintStart, mintEnd, pricePerToken, redeemToken] = settingsData
    ? unpackOptionalArray(settingsData as [bigint, bigint, bigint, AddressType], 4)
    : [undefined, undefined, undefined, undefined]

  const hasSettings = redeemToken && !isAddressEqual(redeemToken, zeroAddress)

  const handleResetSettings = useCallback(async () => {
    setIsResetting(true)
    try {
      const data = await simulateContract(config, {
        abi: erc721RedeemMinterAbi,
        address: minterAddress as AddressType,
        functionName: 'resetMintSettings',
        args: [addresses.token!],
        chainId: chain.id,
      })
      const hash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, { hash, chainId: chain.id })
      await refetch()
      setIsEditing(true)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    } finally {
      setIsResetting(false)
    }
  }, [chain.id, config, minterAddress, addresses.token, refetch])

  const handleSaveSuccess = async () => {
    await refetch()
    setIsEditing(false)
  }

  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return 'Not set'
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }

  const isActive = useMemo(() => {
    if (!mintStart || !mintEnd) return false
    const now = Math.floor(Date.now() / 1000)
    return Number(mintStart) <= now && now <= Number(mintEnd)
  }, [mintStart, mintEnd])

  if (isLoading)
    return (
      <Flex direction="column" p="x6" className={adminSection}>
        <Text>Loading...</Text>
      </Flex>
    )

  if (isEditing || !hasSettings) {
    return (
      <Flex direction="column" p="x6" className={adminSection}>
        <Section title="Configure Mint Settings">
          <SettingsForm
            chain={chain}
            minterAddress={minterAddress as AddressType}
            tokenAddress={addresses.token!}
            initialValues={{
              mintStart: mintStart
                ? new Date(Number(mintStart) * 1000)
                : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
              mintEnd: mintEnd
                ? new Date(Number(mintEnd) * 1000)
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
              pricePerToken: pricePerToken ? parseFloat(formatEther(pricePerToken)) : 0,
              redeemToken: redeemToken || '',
            }}
            onSuccess={handleSaveSuccess}
            onCancel={hasSettings ? () => setIsEditing(false) : undefined}
          />
        </Section>
      </Flex>
    )
  }

  return (
    <Flex direction="column" p="x6" gap="x6" className={adminSection}>
      <Section title="Mint Settings">
        <Box className={settingsCard}>
          <Box className={settingsRow}>
            <Box className={settingsLabel}>Mint Start</Box>
            <Box className={settingsValue}>{formatDate(mintStart)}</Box>
          </Box>
          <Box className={settingsRow}>
            <Box className={settingsLabel}>Mint End</Box>
            <Box className={settingsValue}>{formatDate(mintEnd)}</Box>
          </Box>
          <Box className={settingsRow}>
            <Box className={settingsLabel}>Price Per Token</Box>
            <Box className={settingsValue}>
              {pricePerToken ? `${formatEther(pricePerToken)} ETH` : '0 ETH'}
            </Box>
          </Box>
          <Box className={settingsRow}>
            <Box className={settingsLabel}>Redeem Token</Box>
            <Box className={settingsValue}>
              <ContractLink address={redeemToken} chainId={chain.id} size="sm" noBorder />
            </Box>
          </Box>
          <Box className={settingsRow}>
            <Box className={settingsLabel}>Status</Box>
            <Box
              className={settingsValue}
              style={{ color: isActive ? 'green' : 'orange' }}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Box>
          </Box>
        </Box>

        <Stack direction="row" gap="x3" mt="x4">
          <Button onClick={() => setIsEditing(true)} style={{ flex: 1 }}>
            Edit Settings
          </Button>
          <Button
            onClick={handleResetSettings}
            disabled={isResetting}
            loading={isResetting}
            variant="secondary"
            style={{ flex: 1 }}
          >
            Reset Settings
          </Button>
        </Stack>
      </Section>

      {isActive && (
        <Section title="Mint Tokens">
          <MintingForm
            chain={chain}
            minterAddress={minterAddress as AddressType}
            tokenAddress={addresses.token!}
            pricePerToken={pricePerToken}
          />
        </Section>
      )}

      {!isActive && (
        <Box mt="x4" p="x4" style={{ background: '#FFF3CD', borderRadius: '8px' }}>
          <Text color="text1" fontSize="14">
            Minting is not currently active. The minting period is from{' '}
            {formatDate(mintStart)} to {formatDate(mintEnd)}.
          </Text>
        </Box>
      )}
    </Flex>
  )
}
