import { BASE_URL, WALLET_CONNECT_PROJECT_ID } from '@buildeross/constants'
import { chains, transports } from '@buildeross/utils/wagmi'
import { farcasterFrame as miniAppConnector } from '@farcaster/frame-wagmi-connector'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  coinbaseWallet,
  injectedWallet,
  ledgerWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { Attribution } from 'ox/erc8021'
import { createConfig, CreateConnectorFn } from 'wagmi'

const appName = 'Nouns Builder'
const appDescription = 'Nouns Builder'
const appUrl = BASE_URL
const appIcon = ''

const metadata = {
  name: appName,
  description: appDescription ?? appName,
  url: appUrl,
  icons: [...(appIcon ? [appIcon] : [])],
}

const rainbowConnectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [
        injectedWallet,
        rainbowWallet,
        coinbaseWallet,
        walletConnectWallet,
        ledgerWallet,
        safeWallet,
      ],
    },
  ],
  {
    projectId: WALLET_CONNECT_PROJECT_ID,
    appName,
    appDescription,
    appUrl,
    appIcon,
    walletConnectParameters: { metadata },
  }
)

const connectors: CreateConnectorFn[] = [
  ...rainbowConnectors,
  miniAppConnector as unknown as CreateConnectorFn,
]

const baseBuilderCode = process.env.NEXT_PUBLIC_BASE_BUILDER_CODE?.trim()
const dataSuffix = baseBuilderCode
  ? Attribution.toDataSuffix({
      codes: [baseBuilderCode],
    })
  : undefined

export const clientConfig = createConfig({
  ssr: true,
  chains,
  transports,
  connectors,
  ...(dataSuffix ? { dataSuffix } : {}),
})
