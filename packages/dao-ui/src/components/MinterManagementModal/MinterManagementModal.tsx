import { ERC721_REDEEM_MINTER, MERKLE_RESERVE_MINTER } from '@buildeross/constants'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { tokenAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { SmartInput } from '@buildeross/ui/Fields'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { getEnsAddress } from '@buildeross/utils/ens'
import { Box, Button, Flex, Heading, Icon, Text, theme } from '@buildeross/zord'
import React from 'react'
import { isAddress, zeroAddress } from 'viem'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { readContract, waitForTransactionReceipt } from 'wagmi/actions'

interface MinterManagementModalProps {
  open: boolean
  close: () => void
  remainingTokensInReserve?: bigint
  isMerkleReserveMinter?: boolean
  isERC721RedeemMinter?: boolean
  onMinterEnabled?: (minterAddress: AddressType) => void
}

const isValidAddress = (address: AddressType | undefined) =>
  !!address && isAddress(address, { strict: false }) && address !== zeroAddress

interface MinterCardProps {
  title: string
  description: string
  address: AddressType
  isChecked: boolean
  onToggle: (checked: boolean) => void
  disabled?: boolean
  hasChanges?: boolean
  onRemove?: () => void
}

const MinterCard: React.FC<MinterCardProps> = ({
  title,
  description,
  address,
  isChecked,
  onToggle,
  disabled = false,
  hasChanges = false,
  onRemove,
}) => {
  const { ensName } = useEnsData(address)
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const displayAddress = ensName || truncatedAddress
  const checkboxId = `minter-${address}-checkbox`

  return (
    <Box
      p="x4"
      borderRadius="curved"
      borderWidth="normal"
      borderStyle="solid"
      borderColor={hasChanges ? 'accent' : 'border'}
      backgroundColor="background1"
      style={{
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
      }}
      position="relative"
    >
      <Flex justify="space-between" align="flex-start">
        <Flex direction="column" gap="x2" flex={1} pr={onRemove ? 'x16' : 'x0'}>
          <Flex align="center" gap="x2" id={`${checkboxId}-label`}>
            <Text fontWeight="display" fontSize={16}>
              {title}
            </Text>
            {hasChanges && (
              <Flex
                align="center"
                px="x2"
                py="x1"
                borderRadius="round"
                backgroundColor="accent"
                style={{ fontSize: 12 }}
              >
                <Text color="background1" fontSize={12} fontWeight="label">
                  Modified
                </Text>
              </Flex>
            )}
          </Flex>
          <Text color="text3" fontSize={14}>
            {description}
          </Text>
          <Text
            color="text4"
            fontSize={12}
            fontFamily="mono"
            title={ensName ? `${ensName} (${address})` : address}
            style={{ cursor: 'pointer' }}
          >
            {displayAddress}
          </Text>
        </Flex>
        <Flex align="center" gap="x2">
          {onRemove && (
            <Button
              onClick={onRemove}
              disabled={disabled}
              variant="ghost"
              style={{
                minWidth: 'auto',
                padding: '4px 8px',
                fontSize: '12px',
              }}
            >
              <Icon id="cross-16" style={{ width: 16, height: 16 }} />
            </Button>
          )}
          <Flex align="center" gap="x2">
            <input
              id={checkboxId}
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onToggle(e.target.checked)}
              disabled={disabled}
              aria-labelledby={`${checkboxId}-label`}
              style={{
                width: '20px',
                height: '20px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                accentColor: theme.colors.accent,
              }}
            />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

export const MinterManagementModal: React.FC<MinterManagementModalProps> = ({
  open,
  close,
  remainingTokensInReserve,
  isMerkleReserveMinter,
  isERC721RedeemMinter,
  onMinterEnabled,
}) => {
  const { address: signerAddress } = useAccount()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()

  const [isSettingUpMinter, setIsSettingUpMinter] = React.useState(false)
  const [customMinterInput, setCustomMinterInput] = React.useState<string>('')
  const [customMinters, setCustomMinters] = React.useState<AddressType[]>([])
  const [customMinterStatuses, setCustomMinterStatuses] = React.useState<
    Record<AddressType, boolean>
  >({})
  const [isCheckingCustomMinter, setIsCheckingCustomMinter] = React.useState(false)
  const [pendingMinterStates, setPendingMinterStates] = React.useState<
    Record<AddressType, boolean>
  >({})

  const merkleMinter = MERKLE_RESERVE_MINTER[chain.id]
  const redeemMinter = ERC721_REDEEM_MINTER[chain.id]

  // Add custom minter to list and check its status
  const handleAddCustomMinter = React.useCallback(async () => {
    if (!customMinterInput) return

    try {
      setIsCheckingCustomMinter(true)

      // Resolve ENS name to address if needed
      const resolvedAddress = await getEnsAddress(customMinterInput)

      if (!resolvedAddress || !isAddress(resolvedAddress)) {
        setIsCheckingCustomMinter(false)
        return
      }

      // Check if already in list or is a default minter
      if (
        customMinters.includes(resolvedAddress as AddressType) ||
        resolvedAddress === merkleMinter ||
        resolvedAddress === redeemMinter
      ) {
        setCustomMinterInput('')
        setIsCheckingCustomMinter(false)
        return
      }

      const status = await readContract(config, {
        abi: tokenAbi,
        address: addresses.token!,
        functionName: 'minter',
        args: [resolvedAddress as AddressType],
        chainId: chain.id,
      })

      setCustomMinters((prev) => [...prev, resolvedAddress as AddressType])
      setCustomMinterStatuses((prev) => ({
        ...prev,
        [resolvedAddress as AddressType]: status as boolean,
      }))
      setCustomMinterInput('')
    } catch (e) {
      console.error('Error checking minter status:', e)
    } finally {
      setIsCheckingCustomMinter(false)
    }
  }, [
    customMinterInput,
    customMinters,
    merkleMinter,
    redeemMinter,
    addresses.token,
    chain.id,
    config,
  ])

  const handleRemoveCustomMinter = React.useCallback((address: AddressType) => {
    setCustomMinters((prev) => prev.filter((addr) => addr !== address))
    setCustomMinterStatuses((prev) => {
      const newStatuses = { ...prev }
      delete newStatuses[address]
      return newStatuses
    })
    setPendingMinterStates((prev) => {
      const newPending = { ...prev }
      delete newPending[address]
      return newPending
    })
  }, [])

  const getMinterState = React.useCallback(
    (address: AddressType): boolean => {
      if (address in pendingMinterStates) {
        return pendingMinterStates[address]
      }
      if (address === merkleMinter) return !!isMerkleReserveMinter
      if (address === redeemMinter) return !!isERC721RedeemMinter
      if (address in customMinterStatuses) return customMinterStatuses[address]
      return false
    },
    [
      pendingMinterStates,
      merkleMinter,
      redeemMinter,
      customMinterStatuses,
      isMerkleReserveMinter,
      isERC721RedeemMinter,
    ]
  )

  const hasPendingChange = React.useCallback(
    (address: AddressType): boolean => {
      if (!(address in pendingMinterStates)) return false

      let actualState = false
      if (address === merkleMinter) actualState = !!isMerkleReserveMinter
      else if (address === redeemMinter) actualState = !!isERC721RedeemMinter
      else if (address in customMinterStatuses)
        actualState = customMinterStatuses[address]

      return pendingMinterStates[address] !== actualState
    },
    [
      pendingMinterStates,
      merkleMinter,
      redeemMinter,
      customMinterStatuses,
      isMerkleReserveMinter,
      isERC721RedeemMinter,
    ]
  )

  const handleToggleMinter = React.useCallback(
    (address: AddressType, checked: boolean) => {
      setPendingMinterStates((prev) => ({
        ...prev,
        [address]: checked,
      }))
    },
    []
  )

  const getChangesToApply = React.useCallback(() => {
    const changes: Array<{ minter: AddressType; allowed: boolean }> = []

    Object.entries(pendingMinterStates).forEach(([address, newState]) => {
      const addr = address as AddressType
      let currentState = false

      if (addr === merkleMinter) currentState = !!isMerkleReserveMinter
      else if (addr === redeemMinter) currentState = !!isERC721RedeemMinter
      else if (addr in customMinterStatuses) currentState = customMinterStatuses[addr]

      if (newState !== currentState) {
        changes.push({ minter: addr, allowed: newState })
      }
    })

    return changes
  }, [
    pendingMinterStates,
    merkleMinter,
    redeemMinter,
    customMinterStatuses,
    isMerkleReserveMinter,
    isERC721RedeemMinter,
  ])

  const handleSaveChanges = React.useCallback(async () => {
    const changes = getChangesToApply()

    if (changes.length === 0) return

    try {
      setIsSettingUpMinter(true)

      const txHash = await writeContractAsync({
        abi: tokenAbi,
        address: addresses.token!,
        functionName: 'updateMinters',
        args: [changes],
        chainId: chain.id,
      })

      if (txHash) {
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
      }

      setPendingMinterStates({})
      close()

      // Notify parent if a minter was enabled
      const enabledMinter = changes.find((c) => c.allowed)
      if (enabledMinter && onMinterEnabled) {
        onMinterEnabled(enabledMinter.minter)
      }
    } catch (e) {
      console.error(`Error updating minters: ${e}`)
    } finally {
      setIsSettingUpMinter(false)
    }
  }, [
    getChangesToApply,
    chain.id,
    addresses.token,
    config,
    writeContractAsync,
    close,
    onMinterEnabled,
  ])

  const handleResetChanges = React.useCallback(() => {
    setPendingMinterStates({})
  }, [])

  const pendingChanges = React.useMemo(() => getChangesToApply(), [getChangesToApply])
  const hasAnyPendingChanges = pendingChanges.length > 0

  const handleClose = React.useCallback(() => {
    handleResetChanges()
    close()
  }, [close, handleResetChanges])

  return (
    <AnimatedModal open={open} close={handleClose} size="medium">
      <Flex direction="column" p="x6" gap="x6">
        <Box>
          <Heading size="lg" mb="x2">
            Manage Minters
          </Heading>
          <Text color="text3">
            You have {remainingTokensInReserve?.toString() ?? '0'} tokens in reserve.
            Enable or disable minter contracts below, then click Save Changes to apply
            your selections.
          </Text>
        </Box>

        {/* Default Minters Section */}
        {(isValidAddress(redeemMinter) || isValidAddress(merkleMinter)) && (
          <Flex direction="column" gap="x3">
            <Text fontWeight="display" fontSize={14} color="text4">
              DEFAULT MINTERS
            </Text>

            {isValidAddress(redeemMinter) && (
              <MinterCard
                title="ERC721 Redeem Minter"
                description="Allows users to redeem specific ERC721 tokens for tokens from your reserve"
                address={redeemMinter}
                isChecked={getMinterState(redeemMinter)}
                onToggle={(checked) => handleToggleMinter(redeemMinter, checked)}
                disabled={!signerAddress || isSettingUpMinter}
                hasChanges={hasPendingChange(redeemMinter)}
              />
            )}

            {isValidAddress(merkleMinter) && (
              <MinterCard
                title="Merkle Reserve Minter"
                description="Allows eligible addresses to claim tokens using a merkle proof"
                address={merkleMinter}
                isChecked={getMinterState(merkleMinter)}
                onToggle={(checked) => handleToggleMinter(merkleMinter, checked)}
                disabled={!signerAddress || isSettingUpMinter}
                hasChanges={hasPendingChange(merkleMinter)}
              />
            )}
          </Flex>
        )}

        {/* Custom Minter Section */}
        <Flex direction="column" gap="x3">
          <Text fontWeight="display" fontSize={14} color="text4">
            CUSTOM MINTERS
          </Text>
          <Text color="text3" fontSize={14}>
            Add custom minter addresses to manage them
          </Text>

          <Flex gap="x2" align="center">
            <Box style={{ flex: 1 }}>
              <SmartInput
                id="customMinterInput"
                type="text"
                value={customMinterInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCustomMinterInput(e.target.value)
                }
                placeholder="0x... or .eth"
                disabled={isSettingUpMinter || isCheckingCustomMinter}
                isAddress
              />
            </Box>
            <Button
              onClick={handleAddCustomMinter}
              disabled={!customMinterInput || isSettingUpMinter || isCheckingCustomMinter}
              variant="secondary"
              style={{ minWidth: '80px', marginBottom: '32px' }}
            >
              {isCheckingCustomMinter ? 'Adding...' : 'Add'}
            </Button>
          </Flex>

          {customMinters.length > 0 && (
            <Flex direction="column" gap="x2">
              {customMinters.map((minterAddr) => (
                <MinterCard
                  key={minterAddr}
                  title="Custom Minter"
                  description="Custom minter contract address"
                  address={minterAddr}
                  isChecked={getMinterState(minterAddr)}
                  onToggle={(checked) => handleToggleMinter(minterAddr, checked)}
                  disabled={!signerAddress || isSettingUpMinter}
                  hasChanges={hasPendingChange(minterAddr)}
                  onRemove={() => handleRemoveCustomMinter(minterAddr)}
                />
              ))}
            </Flex>
          )}
        </Flex>

        {/* Action Buttons */}
        <Flex
          gap="x3"
          pt="x4"
          style={{ borderColor: theme.colors.border, borderTop: '1px solid' }}
        >
          <Button
            variant="ghost"
            onClick={handleResetChanges}
            disabled={!hasAnyPendingChanges || isSettingUpMinter}
            style={{ flex: 1 }}
          >
            Reset Changes
          </Button>
          <ContractButton
            chainId={chain.id}
            handleClick={handleSaveChanges}
            disabled={!hasAnyPendingChanges || !signerAddress || isSettingUpMinter}
            loading={isSettingUpMinter}
            variant="secondary"
            style={{ flex: 1 }}
          >
            {isSettingUpMinter
              ? 'Saving...'
              : `Save Changes${hasAnyPendingChanges ? ` (${pendingChanges.length})` : ''}`}
          </ContractButton>
        </Flex>
      </Flex>
    </AnimatedModal>
  )
}
