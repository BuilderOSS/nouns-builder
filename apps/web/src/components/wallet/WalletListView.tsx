'use client'

import { Button, Icon, Stack, Text } from '@buildeross/zord'

import type { WalletInfo } from '../../types/auth'
import { WalletOption } from '../WalletOption'

interface WalletListViewProps {
  wallets: WalletInfo[]
  onSelectWallet: (walletId: string) => void
  onSelectSafe: () => void
  showSafeOption?: boolean
  title?: string
  description?: string
}

export function WalletListView({
  wallets,
  onSelectWallet,
  onSelectSafe,
  showSafeOption = true,
  title = 'Connect Wallet',
  description,
}: WalletListViewProps) {
  const installedWallets = wallets.filter((w) => !w.isRainbowKitConnector)
  const popularWallets = wallets.filter((w) => w.isRainbowKitConnector)

  return (
    <Stack gap="x4">
      <Stack gap="x1">
        <Text variant="heading-sm">{title}</Text>
        {description && (
          <Text variant="paragraph-sm" color="text3">
            {description}
          </Text>
        )}
      </Stack>

      {installedWallets.length > 0 && (
        <Stack gap="x0">
          <Text variant="label-sm" color="text3">
            Installed
          </Text>
          {installedWallets.map((wallet) => (
            <WalletOption
              key={wallet.id}
              name={wallet.name}
              icon={wallet.iconUrl || ''}
              iconBackground="#ffffff"
              recent={wallet.recent}
              onClick={() => onSelectWallet(wallet.id)}
            />
          ))}
        </Stack>
      )}

      <Stack gap="x0">
        <Text variant="label-sm" color="text3">
          Popular
        </Text>
        {popularWallets.map((wallet) => (
          <WalletOption
            key={wallet.id}
            name={wallet.name}
            icon={wallet.iconUrl || ''}
            iconBackground="#ffffff"
            recent={wallet.recent}
            onClick={() => onSelectWallet(wallet.id)}
          />
        ))}
      </Stack>

      {showSafeOption && (
        <Stack gap="x0">
          <Text variant="label-sm" color="text3">
            Multi-Sig
          </Text>
          <WalletOption
            name="Safe"
            icon="/icons/wallets/safe.svg"
            iconBackground="#12ff80"
            onClick={onSelectSafe}
          />
        </Stack>
      )}

      <Text
        variant="label-xs"
        color="text3"
        style={{ textAlign: 'center', lineHeight: 1.5, opacity: 0.8 }}
      >
        By connecting a wallet, you acknowledge and agree to the Nouns Builder{' '}
        <Text
          as="a"
          href="/legal"
          target="_blank"
          rel="noopener noreferrer"
          color="accent"
          style={{ textDecoration: 'underline' }}
        >
          Terms of Service
        </Text>{' '}
        and{' '}
        <Text
          as="a"
          href="https://support.zora.co/en/articles/6383373-zora-privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          color="accent"
          style={{ textDecoration: 'underline' }}
        >
          Privacy Policy
        </Text>
        .
      </Text>

      <Button
        as="a"
        href="https://ethereum.org/wallets/find-wallet/#main-content"
        target="_blank"
        rel="noopener noreferrer"
        align="center"
        justify="center"
        gap="x2"
        p="x3"
        style={{ textDecoration: 'none' }}
        variant="secondary"
        size="sm"
      >
        <Text variant="label-xs" color="accent">
          I don't have a wallet
        </Text>
        <Icon id="question" size="sm" />
      </Button>
    </Stack>
  )
}
