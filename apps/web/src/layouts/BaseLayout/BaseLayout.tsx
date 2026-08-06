import {
  buildCandidateStoreNamespace,
  buildProposalStoreNamespace,
  CandidateStoreProvider,
  ChainStoreProvider,
  createChainStore,
  createDaoStore,
  DaoStoreProvider,
  getCandidateStore,
  getProposalStore,
  ProposalStoreProvider,
  useAuthStore,
  useChainStore,
  useDaoStore,
} from '@buildeross/stores'
import type { Chain, DaoContractAddresses } from '@buildeross/types'
import { ConnectModalProvider } from '@buildeross/ui/ConnectModalProvider'
import { Box } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import React, { ReactNode, useMemo } from 'react'
import { zeroAddress as ZERO_ADDRESS } from 'viem'

import { SafeTransactionHandler } from '../../contexts/SafeTransactionHandler'
import { Nav as DefaultLayoutNav } from '../DefaultLayout/Nav'

type BoxProps = React.ComponentProps<typeof Box>

type BaseLayoutProps = {
  children: ReactNode
  chain?: Chain
  addresses?: DaoContractAddresses
  footer?: ReactNode
  nav?: ReactNode
  hideChainMenu?: boolean
} & BoxProps

export function BaseLayout({
  children,
  chain,
  addresses,
  footer,
  nav,
  hideChainMenu = false,
  ...props
}: BaseLayoutProps) {
  const { style, ...rest } = props
  const chainStore = useMemo(() => createChainStore(chain), [chain])
  const daoStore = useMemo(() => createDaoStore(addresses), [addresses])
  const { openConnectModal } = useConnectModal()

  return (
    <ConnectModalProvider value={{ openConnectModal }}>
      <ChainStoreProvider store={chainStore}>
        <DaoStoreProvider store={daoStore}>
          <DraftStoreProviders>
            <Box style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              {nav || <DefaultLayoutNav hideChainMenu={hideChainMenu} />}
              <Box style={{ ...style, flex: 1 }} {...rest}>
                {children}
              </Box>
              {footer}
            </Box>
            <SafeTransactionHandler />
          </DraftStoreProviders>
        </DaoStoreProvider>
      </ChainStoreProvider>
    </ConnectModalProvider>
  )
}

function DraftStoreProviders({ children }: { children: ReactNode }) {
  const chain = useChainStore((state) => state.chain)
  const addresses = useDaoStore((state) => state.addresses)
  const { address } = useAuthStore()

  const walletAddress = address ?? ZERO_ADDRESS
  const tokenAddress = addresses.token ?? ZERO_ADDRESS

  const proposalNamespace = useMemo(
    () =>
      buildProposalStoreNamespace({
        chainId: chain.id,
        walletAddress,
        tokenAddress,
      }),
    [chain.id, walletAddress, tokenAddress]
  )

  const candidateNamespace = useMemo(
    () =>
      buildCandidateStoreNamespace({
        chainId: chain.id,
        walletAddress,
        tokenAddress,
      }),
    [chain.id, walletAddress, tokenAddress]
  )

  const proposalStore = useMemo(
    () => getProposalStore(proposalNamespace),
    [proposalNamespace]
  )
  const candidateStore = useMemo(
    () => getCandidateStore(candidateNamespace),
    [candidateNamespace]
  )

  return (
    <ProposalStoreProvider store={proposalStore}>
      <CandidateStoreProvider store={candidateStore}>{children}</CandidateStoreProvider>
    </ProposalStoreProvider>
  )
}
