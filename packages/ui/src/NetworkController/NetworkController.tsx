import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
}

const FeatureMainnet = ({ children }: ContainerProps) => {
  if (!PUBLIC_IS_TESTNET) return <>{children}</>
  return null
}

const FeatureTestnet = ({ children }: ContainerProps) => {
  if (PUBLIC_IS_TESTNET) return <>{children}</>
  return null
}

type NetworkControllerType = {
  Mainnet: React.FC<ContainerProps>
  Testnet: React.FC<ContainerProps>
}

export const NetworkController: NetworkControllerType = {
  Mainnet: FeatureMainnet,
  Testnet: FeatureTestnet,
}
