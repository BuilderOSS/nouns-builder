import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useUserDaos } from '@buildeross/hooks/useUserDaos'
import { tokenAbi } from '@buildeross/sdk/contract'
import { daoMembershipRequest } from '@buildeross/sdk/subgraph'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'
import {
  delegateDaoButton,
  delegateDaoButtonActive,
  delegateDaoDropdown,
  delegateDaoDropdownButton,
  delegateDaoDropdownMenu,
  delegateDaoImage,
  delegateDaoMeta,
  delegateModalSection,
  filterLabel,
} from 'src/styles/profile.css'
import useSWR from 'swr'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

type DelegateToProfileModalProps = {
  open: boolean
  onClose: () => void
  profileAddress: AddressType
  profileName: string
}

type DelegatableDao = {
  chainId: CHAIN_ID
  collectionAddress: AddressType
  contractImage: string
  governorAddress: AddressType
  name: string
  tokenCount: number
  voteCount: number
  currentDelegate: AddressType
}

export const DelegateToProfileModal: React.FC<DelegateToProfileModalProps> = ({
  open,
  onClose,
  profileAddress,
  profileName,
}) => {
  const config = useConfig()
  const { address } = useAccount()
  const { daos, isLoading: isLoadingDaos } = useUserDaos({
    address,
    enabled: open && !!address,
  })
  const [selectedDaoKey, setSelectedDaoKey] = React.useState<string | null>(null)
  const [txHash, setTxHash] = React.useState<`0x${string}` | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isDelegating, setIsDelegating] = React.useState(false)
  const [isDaoMenuOpen, setIsDaoMenuOpen] = React.useState(false)

  const { data: delegatableDaos, isLoading: isLoadingMemberships } = useSWR(
    open && address && daos.length > 0
      ? ([
          'profile-delegatable-daos',
          address,
          daos.map((dao) => dao.collectionAddress).join(','),
        ] as const)
      : null,
    async () => {
      const results: Array<DelegatableDao | null> = await Promise.all(
        daos.map(async (dao) => {
          const membership = await daoMembershipRequest(
            dao.chainId,
            dao.collectionAddress,
            address as AddressType
          )

          if (!membership || membership.tokenCount < 1) return null

          return {
            chainId: dao.chainId,
            collectionAddress: dao.collectionAddress as AddressType,
            contractImage: dao.contractImage,
            governorAddress: dao.governorAddress as AddressType,
            name: dao.name,
            tokenCount: membership.tokenCount,
            voteCount: membership.voteCount,
            currentDelegate: membership.delegate,
          } satisfies DelegatableDao
        })
      )

      return results.filter((dao): dao is DelegatableDao => dao !== null)
    },
    {
      revalidateOnFocus: false,
    }
  )

  React.useEffect(() => {
    if (!open) {
      setSelectedDaoKey(null)
      setTxHash(null)
      setError(null)
      setIsDelegating(false)
      setIsDaoMenuOpen(false)
    }
  }, [open])

  React.useEffect(() => {
    if (selectedDaoKey || !delegatableDaos?.length) return
    const firstDao = delegatableDaos[0]
    setSelectedDaoKey(`${firstDao.chainId}:${firstDao.collectionAddress}`)
  }, [delegatableDaos, selectedDaoKey])

  const selectedDao = React.useMemo(
    () =>
      delegatableDaos?.find(
        (dao) => `${dao.chainId}:${dao.collectionAddress}` === selectedDaoKey
      ),
    [delegatableDaos, selectedDaoKey]
  )

  const handleDelegate = async () => {
    if (!selectedDao) return

    setError(null)
    setTxHash(null)
    setIsDelegating(true)

    try {
      const data = await simulateContract(config, {
        abi: tokenAbi,
        address: selectedDao.collectionAddress,
        chainId: selectedDao.chainId,
        functionName: 'delegate',
        args: [profileAddress],
      })
      const hash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, { hash, chainId: selectedDao.chainId })
      setTxHash(hash)
    } catch (err) {
      console.error('Failed to delegate to profile:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Delegation failed. Please check your wallet and try again.'
      )
    } finally {
      setIsDelegating(false)
    }
  }

  const isLoading = isLoadingDaos || isLoadingMemberships
  const transactionUrl =
    txHash && selectedDao
      ? `${ETHERSCAN_BASE_URL[selectedDao.chainId]}/tx/${txHash}`
      : undefined
  const chainNamesById = React.useMemo(
    () => new Map(PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain.name])),
    []
  )

  const renderDaoRow = React.useCallback(
    (dao: DelegatableDao) => (
      <Flex align="center" justify="space-between" gap="x3" style={{ minWidth: 0 }}>
        <Flex align="center" gap="x3" style={{ minWidth: 0, flex: 1 }}>
          <FallbackImage
            src={dao.contractImage}
            alt={dao.name}
            width={32}
            height={32}
            className={delegateDaoImage}
          />
          <div className={delegateDaoMeta}>
            <Text
              fontWeight="display"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {dao.name}
            </Text>
            <Text color="text3" fontSize="12">
              {walletSnippet(dao.collectionAddress)} /{' '}
              {chainNamesById.get(dao.chainId) ?? dao.chainId}
            </Text>
          </div>
        </Flex>
        <Text color="text3" style={{ flexShrink: 0 }}>
          {dao.tokenCount} token{dao.tokenCount === 1 ? '' : 's'}
        </Text>
      </Flex>
    ),
    [chainNamesById]
  )

  return (
    <AnimatedModal open={open} close={onClose} size="medium">
      <Flex direction="column" gap="x5" w="100%">
        <Flex direction="column" gap="x2">
          <Text variant="heading-sm">Delegate to profile</Text>
          <Text color="text3">
            Delegate your DAO voting power to{' '}
            {profileName || walletSnippet(profileAddress)}.
          </Text>
        </Flex>

        {!address ? (
          <Box className={delegateModalSection}>
            <Text color="text3">
              Connect your wallet to see DAOs where you own delegatable tokens.
            </Text>
          </Box>
        ) : isLoading ? (
          <Box className={delegateModalSection}>
            <Text color="text3">Checking your delegatable DAOs...</Text>
          </Box>
        ) : delegatableDaos?.length ? (
          <>
            <Flex direction="column" gap="x2">
              <Text className={filterLabel}>Choose DAO</Text>
              <div className={delegateDaoDropdown}>
                <button
                  type="button"
                  className={delegateDaoDropdownButton}
                  onClick={() => setIsDaoMenuOpen((current) => !current)}
                  aria-expanded={isDaoMenuOpen}
                >
                  <Flex align="center" justify="space-between" gap="x3">
                    <Box style={{ minWidth: 0, flex: 1 }}>
                      {selectedDao ? renderDaoRow(selectedDao) : 'Select DAO'}
                    </Box>
                    <Icon id={isDaoMenuOpen ? 'chevron-up' : 'chevron-down'} size="sm" />
                  </Flex>
                </button>

                {isDaoMenuOpen ? (
                  <div className={delegateDaoDropdownMenu}>
                    {delegatableDaos.map((dao) => {
                      const daoKey = `${dao.chainId}:${dao.collectionAddress}`
                      const isSelected = selectedDaoKey === daoKey
                      return (
                        <button
                          key={daoKey}
                          className={[
                            delegateDaoButton,
                            isSelected ? delegateDaoButtonActive : undefined,
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            setSelectedDaoKey(daoKey)
                            setIsDaoMenuOpen(false)
                          }}
                          type="button"
                          aria-pressed={isSelected}
                        >
                          {renderDaoRow(dao)}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </Flex>

            {selectedDao ? (
              <Box className={delegateModalSection}>
                <Flex direction="column" gap="x2">
                  <Text>
                    <strong>Target delegate:</strong>{' '}
                    {profileName || walletSnippet(profileAddress)}
                  </Text>
                  <Text>
                    <strong>Current delegate:</strong>{' '}
                    {selectedDao.currentDelegate
                      ? walletSnippet(selectedDao.currentDelegate)
                      : 'Unavailable'}
                  </Text>
                  <Text>
                    <strong>Voting power:</strong> {selectedDao.voteCount} current vote
                    {selectedDao.voteCount === 1 ? '' : 's'}
                  </Text>
                </Flex>
              </Box>
            ) : null}

            {error ? <Text color="negative">{error}</Text> : null}
            {transactionUrl ? (
              <Box
                as="a"
                href={transactionUrl}
                target="_blank"
                rel="noopener noreferrer"
                color="text2"
              >
                View transaction
              </Box>
            ) : null}
          </>
        ) : (
          <Box className={delegateModalSection}>
            <Text color="text3">
              No delegatable DAO tokens were found for your connected wallet.
            </Text>
          </Box>
        )}

        <Flex justify="flex-end" gap="x3" wrap>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          {selectedDao ? (
            <ContractButton
              chainId={selectedDao.chainId}
              handleClick={handleDelegate}
              disabled={isDelegating || !!txHash}
              loading={isDelegating}
            >
              {txHash ? 'Delegated' : 'Confirm delegation'}
            </ContractButton>
          ) : null}
        </Flex>
      </Flex>
    </AnimatedModal>
  )
}
