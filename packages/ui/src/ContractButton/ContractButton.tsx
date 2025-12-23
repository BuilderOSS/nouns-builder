import { PUBLIC_ALL_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, ButtonProps, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'

import { useConnectModal } from '../ConnectModalProvider'

export type ContractButtonProps = Omit<ButtonProps, 'onClick' | 'type' | 'ref'> & {
  // Accept an optional click event; callers may also pass a 0-arg handler.
  handleClick: (e?: any) => void | Promise<void>
  chainId: CHAIN_ID
  // Optional function to open connect modal - provided by parent component
  onConnectWallet?: () => void
}

type ErrorType = 'not_connected' | 'wrong_chain'

type ErrorState = {
  type: ErrorType
  message: React.ReactNode
}

export const ContractButton = ({
  children,
  handleClick,
  disabled = false,
  loading = false,
  chainId,
  onConnectWallet,
  ...rest
}: ContractButtonProps) => {
  const { address: userAddress, chain: userChain } = useAccount()
  const { openConnectModal } = useConnectModal()

  const chainName = useMemo(() => {
    const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)
    return chain?.name ?? 'Unknown Chain (ID: ' + chainId + ')'
  }, [chainId])

  const { switchChain } = useSwitchChain()
  const [popupOpen, setPopupOpen] = useState(false)
  const [switchError, setSwitchError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Detect validation errors
  const errorState = useMemo((): ErrorState | null => {
    if (!userAddress) {
      return {
        type: 'not_connected',
        message: 'Please connect your wallet to continue.',
      }
    }
    if (userChain?.id !== chainId) {
      return {
        type: 'wrong_chain',
        message: `Please switch to ${chainName} to continue.`,
      }
    }
    return null
  }, [userAddress, userChain?.id, chainId, chainName])

  // Auto-close popup when error resolves (e.g., user manually switches chain)
  useEffect(() => {
    if (!errorState && popupOpen) {
      setPopupOpen(false)
      setSwitchError(null)
    }
  }, [errorState, popupOpen])

  const handleClickWithValidation = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e?.preventDefault()
      setSwitchError(null) // Clear any previous switch errors

      // If there's a validation error, show popup instead of proceeding
      if (errorState) {
        setPopupOpen(true)
        return
      }

      // All validation passed, proceed with the action
      handleClick(e)
    },
    [errorState, handleClick]
  )

  const handleFixError = useCallback(() => {
    if (!errorState) return

    if (errorState.type === 'not_connected') {
      setPopupOpen(false)
      if (onConnectWallet) {
        onConnectWallet()
      } else if (openConnectModal) {
        openConnectModal()
      }
    } else if (errorState.type === 'wrong_chain') {
      switchChain?.(
        { chainId: chainId },
        {
          onSuccess: () => {
            setPopupOpen(false)
            setSwitchError(null)
          },
          onError: (error) => {
            console.error('ContractButton: switchChain error', error)
            setSwitchError(
              'Failed to switch network. Please switch to ' +
                chainName +
                ' manually in your wallet.'
            )
          },
        }
      )
    }
  }, [errorState, onConnectWallet, openConnectModal, switchChain, chainId, chainName])

  const getActionButtonText = () => {
    if (!errorState) return null
    switch (errorState.type) {
      case 'not_connected':
        return 'Connect Wallet'
      case 'wrong_chain':
        return `Switch to ${chainName}`
      default:
        return null
    }
  }

  // Extract style from rest and merge with error state styling
  const { style: userStyle, ...restProps } = rest
  const mergedStyle = {
    ...userStyle,
    ...(errorState && {
      boxShadow: '0 0 0 2px #EF4444',
    }),
  }

  return (
    <>
      {/* type must be explicitly 'button' to prevent default form submission */}
      <Button
        ref={buttonRef}
        type="button"
        onClick={handleClickWithValidation}
        disabled={disabled || loading}
        loading={loading}
        style={mergedStyle}
        {...restProps}
      >
        {children}
      </Button>
      <PopUp
        triggerRef={buttonRef.current}
        open={popupOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPopupOpen(false)
            setSwitchError(null)
          }
        }}
        placement="top"
      >
        <Box p="x4" maxWidth="x64">
          <Flex direction="column" gap="x3">
            <Flex align="flex-start" gap="x3">
              <Icon id="warning" size="md" fill="negative" />
              <Box>
                <Text variant="paragraph-sm" color="text2">
                  {switchError || errorState?.message}
                </Text>
              </Box>
            </Flex>
            {!switchError && errorState && (
              <Button size="sm" onClick={handleFixError} style={{ width: '100%' }}>
                {getActionButtonText()}
              </Button>
            )}
          </Flex>
        </Box>
      </PopUp>
    </>
  )
}
