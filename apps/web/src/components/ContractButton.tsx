import { useBridgeModal } from '@buildeross/hooks/useBridgeModal'
import { Button, ButtonProps } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useCallback } from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { useAccount, useBalance, useSwitchChain } from 'wagmi'

type SubmitTypeButtonProps = ButtonProps & {
  type?: 'submit'
  handleClick?: never
}

type ButtonTypeButtonProps = ButtonProps & {
  type?: 'button'
  handleClick:
    | ((e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void | Promise<void>)
    | (() => void | Promise<void>)
}

type ContractButtonProps = ButtonTypeButtonProps | SubmitTypeButtonProps

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
  const handleClickWithValidation = useCallback(
    (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e?.preventDefault()

      if (!userAddress) return openConnectModal?.()
      if (canUserBridge && userBalance?.decimals === 0) return openBridgeModal()
      if (userChain?.id !== appChain.id) return switchChain?.({ chainId: appChain.id })

      if (handleClick) {
        handleClick(e)
      } else if (e?.currentTarget?.form?.requestSubmit) {
        e?.currentTarget?.form?.requestSubmit()
      } else {
        console.error('ContractButton: no onClick handler')
      }
    },
    [
      userAddress,
      userChain,
      switchChain,
      appChain.id,
      canUserBridge,
      userBalance,
      openConnectModal,
      openBridgeModal,
      handleClick,
    ]
  )

  return (
    <Button type={type} onClick={handleClickWithValidation} {...rest}>
      {children}
    </Button>
  )
}
