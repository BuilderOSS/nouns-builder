import { Box, Button, ButtonProps, Flex, PopUp, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useCallback, useRef, useState } from 'react'
import { Icon } from 'src/components/Icon'
import { useChainStore } from 'src/stores/useChainStore'
import { useAccount, useBalance, useSwitchChain } from 'wagmi'

export type ContractButtonProps = Omit<ButtonProps, 'onClick' | 'type' | 'ref'> & {
  // Accept an optional click event; callers may also pass a 0-arg handler.
  handleClick: (e?: any) => void | Promise<void>
}

export const ContractButton = ({
  children,
  handleClick,
  disabled = false,
  loading = false,
  ...rest
}: ContractButtonProps) => {
  const { address: userAddress, chain: userChain } = useAccount()
  const appChain = useChainStore((x) => x.chain)
  const { data: userBalance } = useBalance({
    address: userAddress,
    chainId: appChain.id,
  })

  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const [buttonError, setButtonError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const handleClickWithValidation = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e?.preventDefault()
      setButtonError(null) // Clear any previous errors

      const clickHandler = () => {
        if (handleClick) {
          handleClick(e)
        } else {
          console.error('ContractButton: no onClick handler')
        }
      }

      if (!userAddress) return openConnectModal?.()
      if (userBalance?.value === 0n) {
        setButtonError('Insufficient balance')
        return
      }
      if (userChain?.id !== appChain.id) {
        return switchChain?.(
          { chainId: appChain.id },
          {
            onSuccess: () => {
              clickHandler()
            },
            onError: (error) => {
              console.error('ContractButton: switchChain error', error)
              setButtonError(
                'Failed to switch network. Please switch to ' +
                  appChain.name +
                  ' manually in your wallet.'
              )
            },
          }
        )
      }

      clickHandler()
    },
    [
      userAddress,
      userChain,
      switchChain,
      appChain.id,
      appChain.name,
      userBalance,
      openConnectModal,
      handleClick,
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
                {buttonError}
              </Text>
            </Box>
          </Flex>
        </Box>
      </PopUp>
    </>
  )
}
