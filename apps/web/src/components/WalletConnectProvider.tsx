import { useAuthStore } from '@buildeross/stores'
import { ConnectModalProvider } from '@buildeross/ui/ConnectModalProvider'
import dynamic from 'next/dynamic'
import React, { ReactNode, useCallback, useState } from 'react'

const WalletConnectDialog = dynamic(
  () =>
    import('./WalletConnectDialog').then((mod) => ({
      default: mod.WalletConnectDialog,
    })),
  { ssr: false }
)

export function WalletConnectProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const { isConnected, isAuthenticated } = useAuthStore()
  const openConnectModal = useCallback(() => {
    if (isConnected && isAuthenticated) {
      setIsOpen(false)
      return
    }

    setIsOpen(true)
  }, [isAuthenticated, isConnected])

  return (
    <ConnectModalProvider value={{ openConnectModal }}>
      {children}
      <WalletConnectDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </ConnectModalProvider>
  )
}
