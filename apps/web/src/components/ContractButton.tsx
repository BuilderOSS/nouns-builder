import { useBridgeModal } from '@buildeross/hooks/useBridgeModal'
import { Box, Button, ButtonProps, Flex, PopUp, Text } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useCallback, useRef, useState } from 'react'
import { Icon } from 'src/components/Icon'
import { useChainStore } from 'src/stores/useChainStore'
import { useAccount, useBalance, useSwitchChain } from 'wagmi'

// When type is explicitly 'submit', handleClick should not be provided
type SubmitTypeButtonProps = ButtonProps & {
  type: 'submit'
  handleClick?: never
}

// When type is 'button' or undefined (defaults to 'button'), handleClick is required
type ButtonTypeButtonProps = ButtonProps & {
  type?: 'button' | undefined
  handleClick:
    | ((e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void | Promise<void>)
    | (() => void | Promise<void>)
}

type ContractButtonProps = SubmitTypeButtonProps | ButtonTypeButtonProps

export const ContractButton = ({
  children,
  handleClick,
  type = 'button',
  ...rest
}: ContractButtonProps) => {
  const { address: userAddress, chain: userChain } = useAccount()
  const appChain = useChainStore((x) => x.chain)
  const { canUserBridge, openBridgeModal } = useBridgeModal()
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
        } else if (e?.currentTarget?.form?.requestSubmit) {
          e?.currentTarget?.form?.requestSubmit()
        } else {
          console.error('ContractButton: no onClick handler')
        }
      }

      if (!userAddress) return openConnectModal?.()
      if (canUserBridge && userBalance?.decimals === 0) return openBridgeModal()
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
      canUserBridge,
      userBalance,
      openConnectModal,
      openBridgeModal,
      handleClick,
    ]
  )

  return (
    <>
      <Button ref={buttonRef} type={type} onClick={handleClickWithValidation} {...rest}>
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
