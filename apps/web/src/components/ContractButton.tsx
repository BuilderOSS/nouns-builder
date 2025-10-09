import {
  ContractButton as BaseContractButton,
  ContractButtonProps as BaseContractButtonProps,
} from '@buildeross/ui/ContractButton'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import React from 'react'
import { useChainStore } from 'src/stores'

export type ContractButtonProps = Omit<
  BaseContractButtonProps,
  'chainId' | 'zeroBalanceHint'
> & {
  // Accept an optional click event; callers may also pass a 0-arg handler.
  handleClick: (e?: any) => void | Promise<void>
  chainId?: number
}

export const ContractButton = ({
  children,
  handleClick,
  chainId,
  ...rest
}: ContractButtonProps) => {
  const appChain = useChainStore((x) => x.chain)

  const { openConnectModal } = useConnectModal()

  // Default zero balance hint with bridge link for L2 chains
  const zeroBalanceHint = (
    <>
      Insufficient balance. Please add ETH to your wallet via{' '}
      <Link href="/bridge" style={{ textDecoration: 'underline' }}>
        bridging
      </Link>{' '}
      or exchange to complete the transaction.
    </>
  )

  return (
    <BaseContractButton
      chainId={chainId || appChain.id}
      handleClick={handleClick}
      zeroBalanceHint={zeroBalanceHint}
      onConnectWallet={openConnectModal}
      {...rest}
    >
      {children}
    </BaseContractButton>
  )
}
