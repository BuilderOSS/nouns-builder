'use client'

import { useSafeDelegateAuth } from '@buildeross/hooks'
import { AnimatedModal } from '@buildeross/ui'
import { Button } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import type { Address } from 'viem'
import { useAccount } from 'wagmi'

import { useSafeDelegateContext } from '../contexts/SafeDelegateContext'
import { SafeAddressModal } from './SafeAddressModal'

interface SafeDelegateConnectProps {
  onSafeDelegateSelected?: (safeAddress: Address, chainId: number) => void
}

export function SafeDelegateConnect({
  onSafeDelegateSelected,
}: SafeDelegateConnectProps) {
  const [showModal, setShowModal] = useState(false)
  const { openConnectModal } = useConnectModal()
  const { address, isConnected } = useAccount()
  const { state, validateDelegate } = useSafeDelegateAuth()
  const { setSafeDelegateInfo } = useSafeDelegateContext()

  const handleConnectClick = () => {
    if (!isConnected) {
      // First connect the wallet
      openConnectModal?.()
    } else {
      // Wallet already connected, show Safe address modal
      setShowModal(true)
    }
  }

  const handleSubmit = async (safeAddress: Address, chainId: number) => {
    if (!address) return

    // Validate that the connected wallet is a delegate
    const isValid = await validateDelegate(address, safeAddress, chainId)

    if (!isValid) {
      // Error is set in the hook state
      return
    }

    // Save the Safe delegate info to context (used by auth adapter)
    setSafeDelegateInfo(safeAddress, chainId)

    // Notify parent component
    onSafeDelegateSelected?.(safeAddress, chainId)

    // Close modal
    setShowModal(false)
  }

  const handleCancel = () => {
    setShowModal(false)
  }

  return (
    <>
      <Button onClick={handleConnectClick} variant="secondary">
        Connect as Safe Delegate
      </Button>

      <AnimatedModal open={showModal} close={handleCancel} size="medium">
        <SafeAddressModal
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isValidating={state.isValidating}
          error={state.error}
          initialSafeAddress={state.safeAddress || undefined}
          initialChainId={state.chainId || undefined}
        />
      </AnimatedModal>
    </>
  )
}
