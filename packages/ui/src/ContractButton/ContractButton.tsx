import { L2_CHAINS, PUBLIC_ALL_CHAINS, PUBLIC_IS_TESTNET } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, ButtonProps, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useAccount, useBalance, useSwitchChain } from 'wagmi'

export const INSUFFICIENT_BALANCE_ERROR =
  'Insufficient balance. Please add ETH to your wallet to complete the transaction.'

export type ContractButtonProps = Omit<ButtonProps, 'onClick' | 'type' | 'ref'> & {
  // Accept an optional click event; callers may also pass a 0-arg handler.
  handleClick: (e?: any) => void | Promise<void>
  chainId: CHAIN_ID
  // Custom hint to show when user has zero balance, overrides default message
  zeroBalanceHint?: React.ReactNode | string
  // Optional function to open connect modal - provided by parent component
  onConnectWallet?: () => void
}

export const ContractButton = ({
  children,
  handleClick,
  disabled = false,
  loading = false,
  chainId,
  zeroBalanceHint,
  onConnectWallet,
  ...rest
}: ContractButtonProps) => {
  const { address: userAddress, chain: userChain } = useAccount()
  const { data: userBalance } = useBalance({
    address: userAddress,
    chainId: chainId,
  })

  const chainName = useMemo(() => {
    const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
    return chain?.name ?? 'Unknown Chain (ID: ' + chainId + ')'
  }, [chainId])

  const shouldShowCustomHint = useMemo(() => {
    if (PUBLIC_IS_TESTNET) return false
    const isL2 = L2_CHAINS.includes(chainId)
    return isL2 && userBalance?.value === 0n && !!zeroBalanceHint
  }, [chainId, userBalance?.value, zeroBalanceHint])

  const { switchChain } = useSwitchChain()
  const [buttonError, setButtonError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const handleClickWithValidation = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e?.preventDefault()
      setButtonError(null) // Clear any previous errors

      if (!userAddress) {
        if (onConnectWallet) {
          return onConnectWallet()
        } else {
          setButtonError('Please connect your wallet to continue.')
          return
        }
      }
      if (userBalance?.value === 0n) {
        setButtonError(INSUFFICIENT_BALANCE_ERROR)
        return
      }
      if (userChain?.id !== chainId) {
        return switchChain?.(
          { chainId: chainId },
          {
            onSuccess: () => {
              handleClick(e)
            },
            onError: (error) => {
              console.error('ContractButton: switchChain error', error)
              setButtonError(
                'Failed to switch network. Please switch to ' +
                  chainName +
                  ' manually in your wallet.'
              )
            },
          }
        )
      }

      handleClick(e)
    },
    [
      userAddress,
      userChain,
      switchChain,
      chainId,
      chainName,
      userBalance,
      handleClick,
      onConnectWallet,
    ]
  )

  return (
    <>
      {/* type must be explicitly 'button' to prevent default form submission */}
      <Button
        ref={buttonRef}
        type="button"
        onClick={handleClickWithValidation}
        disabled={disabled || loading}
        loading={loading}
        {...rest}
      >
        {children}
      </Button>
      <PopUp
        triggerRef={buttonRef.current}
        open={!!buttonError}
        onOpenChange={(open) => !open && setButtonError(null)}
        placement="top"
      >
        <Box p="x4" maxWidth="x64">
          <Flex align="flex-start" gap="x3">
            <Icon id="warning" size="md" fill="negative" />
            <Box>
              <Text variant="paragraph-sm" color="text2">
                {buttonError === INSUFFICIENT_BALANCE_ERROR && shouldShowCustomHint
                  ? zeroBalanceHint
                  : buttonError}
              </Text>
            </Box>
          </Flex>
        </Box>
      </PopUp>
    </>
  )
}
