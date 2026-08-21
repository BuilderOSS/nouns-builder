import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import type { AddressType } from '@buildeross/types'
import { isOwnProfileAddress } from 'src/utils/profileDashboard'
import { Icon, Text } from '@buildeross/zord'
import React from 'react'
import { useDropdownDismiss } from 'src/hooks/useDropdownDismiss'
import { DelegateToProfileModal } from './DelegateToProfileModal'
import { ProfileLinksEditModal } from './ProfileLinksEditModal'
import type { ProfileIdentity } from 'src/utils/profileIdentity'
import {
  walletScannerMenu,
  walletScannerMenuButton,
  walletScannerMenuItem,
  walletScannerMenuRoot,
} from 'src/styles/profile.css'
import { useAccount } from 'wagmi'

type ProfileWalletScannerMenuProps = {
  address: AddressType
  profileLink: string
  profileAddress: AddressType
  profileName: string
  identity?: ProfileIdentity
  onIdentitySaved?: () => void
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
  profileLink,
  profileAddress,
  profileName,
  identity,
  onIdentitySaved,
}) => {
  const menuId = React.useId().replace(/:/g, '')
  const menuRootRef = React.useRef<HTMLDivElement>(null)
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const { address: connectedAddress } = useAccount()
  const isOwnProfile = isOwnProfileAddress(connectedAddress, profileAddress)
  const [isDelegateModalOpen, setIsDelegateModalOpen] = React.useState(false)
  const [isEditLinksModalOpen, setIsEditLinksModalOpen] = React.useState(false)

  const copyText = React.useCallback(async (value: string, closeAfter = false) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch (error) {
      console.error('Failed to copy text:', error)
    } finally {
      if (closeAfter) setIsOpen(false)
    }
  }, [])

  const scannerLinks = React.useMemo(
    () =>
      PUBLIC_DEFAULT_CHAINS.map((chain) => {
        const baseUrl = ETHERSCAN_BASE_URL[chain.id as keyof typeof ETHERSCAN_BASE_URL]

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
        <Icon id="dots" size="md" />
      </button>

      {isOpen ? (
        <div id={menuId} className={walletScannerMenu}>
          {isOwnProfile ? (
            <button
              type="button"
              className={walletScannerMenuItem}
              onClick={() => {
                setIsOpen(false)
                setIsEditLinksModalOpen(true)
              }}
            >
              <Text as="span">Edit links</Text>
              <Icon id="pencil" size="sm" />
            </button>
          ) : (
            <button
              type="button"
              className={walletScannerMenuItem}
              onClick={() => {
                setIsOpen(false)
                setIsDelegateModalOpen(true)
              }}
            >
              <Text as="span">Delegate</Text>
              <Icon id="pencil" size="sm" />
            </button>
          )}
          <button
            type="button"
            className={walletScannerMenuItem}
            onClick={() => copyText(profileLink, true)}
          >
            <Text as="span">Copy profile URL</Text>
            <Icon id="copy" size="sm" />
          </button>
          <button
            type="button"
            className={walletScannerMenuItem}
            onClick={() => copyText(address, true)}
          >
            <Text as="span">Copy wallet address</Text>
            <Icon id="copy" size="sm" />
          </button>
          {scannerLinks.map((link) => (
            <a
              key={link.chainId}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={walletScannerMenuItem}
            >
              <Text as="span">{link.label}</Text>
              <Icon id="external-16" size="sm" />
            </a>
          ))}
        </div>
      ) : null}
      <ProfileLinksEditModal
        identity={identity}
        profileAddress={profileAddress}
        open={isEditLinksModalOpen}
        onClose={() => setIsEditLinksModalOpen(false)}
        onSaved={() => {
          onIdentitySaved?.()
        }}
      />
      <DelegateToProfileModal
        open={isDelegateModalOpen}
        onClose={() => setIsDelegateModalOpen(false)}
        profileAddress={profileAddress}
        profileName={profileName}
      />
    </div>
  )
}
