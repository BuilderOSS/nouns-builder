import React, { ReactNode } from 'react'

import { PUBLIC_IS_TESTNET } from 'src/constants/chains'

interface NetworkControllerProps {
  children: ReactNode
}

interface FeatureContainerProps {
  children: ReactNode
}

const FeatureMainnet = ({ children }: FeatureContainerProps) => {
  if (!PUBLIC_IS_TESTNET) return <>{children}</>
  return null
}

const FeatureTestnet = ({ children }: FeatureContainerProps) => {
  if (PUBLIC_IS_TESTNET) return <>{children}</>
  return null
}

export const NetworkController = ({ children }: NetworkControllerProps) => {
  return <>{children}</>
}

NetworkController.Mainnet = FeatureMainnet
NetworkController.Testnet = FeatureTestnet
