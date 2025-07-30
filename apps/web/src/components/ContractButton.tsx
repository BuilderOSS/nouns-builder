import { useBridgeModal } from '@buildeross/hooks/useBridgeModal'
import { Button, ButtonProps } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useChainStore } from 'src/stores/useChainStore'
import { useAccount, useBalance, useSwitchChain } from 'wagmi'

interface ContractButtonProps extends ButtonProps {
  handleClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

export const ContractButton = ({
  children,
  handleClick,
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

  const handleSwitchChain = () => switchChain?.({ chainId: appChain.id })

  const handleClickWithValidation = (
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e?.preventDefault()

    if (!userAddress) return openConnectModal?.()
    if (canUserBridge && userBalance?.decimals === 0) return openBridgeModal()
    if (userChain?.id !== appChain.id) return handleSwitchChain()


    if (handleClick) {
      handleClick(e)
    } else {
      // Submit the form manually if all checks pass
      const form = e?.currentTarget?.form
      if (form) {
        form.requestSubmit() // Modern way to trigger a form submission
      }
    }
  }

  return (
    <Button type="button" onClick={handleClickWithValidation} {...rest}>
      {children}
    </Button>
  )
}
