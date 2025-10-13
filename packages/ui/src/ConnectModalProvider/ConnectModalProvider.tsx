import { createContext, useContext } from 'react'

type ConnectModalContextValue = {
  openConnectModal?: () => void
}

const ConnectModalContext = createContext<ConnectModalContextValue>({})

export const useConnectModal = () => {
  return useContext(ConnectModalContext)
}

export const ConnectModalProvider = ConnectModalContext.Provider
