import { createWalletClient, http } from 'viem'
import { createConfig } from 'wagmi'
import { foundry } from 'wagmi/chains'
import { mock } from 'wagmi/connectors'

const ANVIL_URL = foundry.rpcUrls.default.http[0]

const TEST_WALLETS = [
  {
    id: 'alice',
    name: 'Alice',
    iconUrl: '',
    iconBackground: 'red',
    privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
  {
    id: 'bob',
    name: 'Bob',
    iconUrl: '',
    iconBackground: 'blue',
    privateKey: '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  },
  {
    id: 'carol',
    name: 'Carol',
    iconUrl: '',
    iconBackground: 'yellow',
    privateKey: '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
  },
].map((wallet) =>
  createWalletClient({
    account: wallet.privateKey as `0x${string}`,
    transport: http(ANVIL_URL),
  })
)

export const config = createConfig({
  chains: [foundry],
  connectors: [
    mock({
      features: {
        defaultConnected: true,
      },
      accounts: TEST_WALLETS.map((wallet) => wallet.account.address) as [
        `0x${string}`,
        ...`0x${string}`[],
      ],
    }),
  ],
  transports: {
    [foundry.id]: http(ANVIL_URL),
  },
})
