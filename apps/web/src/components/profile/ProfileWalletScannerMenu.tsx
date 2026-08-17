import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import type { AddressType } from '@buildeross/types'
import { Icon, Text } from '@buildeross/zord'
import React from 'react'
import { useDropdownDismiss } from 'src/hooks/useDropdownDismiss'
import {
  walletScannerMenu,
  walletScannerMenuButton,
  walletScannerMenuItem,
  walletScannerMenuRoot,
} from 'src/styles/profile.css'

type ProfileWalletScannerMenuProps = {
  address: AddressType
}

const getScannerLabel = (baseUrl: string, chainName: string) => {
  const host = baseUrl.replace(/^https?:\/\//, '')

  if (host.includes('etherscan')) return chainName === 'Ethereum' ? 'Etherscan' : host
  if (host.includes('basescan')) return chainName === 'Base' ? 'Basescan' : host
  if (host.includes('zora')) return 'Zora Explorer'

  return host || `${chainName} scanner`
}

export const ProfileWalletScannerMenu: React.FC<ProfileWalletScannerMenuProps> = ({
  address,
}) => {
  const menuId = React.useId().replace(/:/g, '')
  const menuRootRef = React.useRef<HTMLDivElement>(null)
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const scannerLinks = React.useMemo(
    () =>
      PUBLIC_DEFAULT_CHAINS.map((chain) => {
        const baseUrl = ETHERSCAN_BASE_URL[chain.id]

        if (!baseUrl) return null

        return {
          chainId: chain.id,
          chainName: chain.name,
          href: `${baseUrl}/address/${address}`,
          label: getScannerLabel(baseUrl, chain.name),
        }
      }).filter((link): link is NonNullable<typeof link> => link !== null),
    [address]
  )

  const closeMenu = React.useCallback(() => setIsOpen(false), [])
  useDropdownDismiss({
    isOpen,
    onDismiss: closeMenu,
    rootRef: menuRootRef,
    triggerRef: menuButtonRef,
  })

  if (!scannerLinks.length) return null

  return (
    <div ref={menuRootRef} className={walletScannerMenuRoot}>
      <button
        ref={menuButtonRef}
        type="button"
        className={walletScannerMenuButton}
        aria-label="Open wallet scanner links"
        aria-controls={menuId}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon id="dots" size="sm" />
      </button>

      {isOpen ? (
        <div id={menuId} className={walletScannerMenu}>
          {scannerLinks.map((link) => (
            <a
              key={link.chainId}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={walletScannerMenuItem}
            >
              <span>
                <Text as="span" fontWeight="display">
                  {link.chainName}
                </Text>
                <Text as="span" color="text3" fontSize="12">
                  {link.label}
                </Text>
              </span>
              <Icon id="external-16" size="sm" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
