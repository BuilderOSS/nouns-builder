import type { DaoContractAddresses, Transaction } from '@buildeross/types'

const contractNames = {
  governor: 'Governor',
  treasury: 'Treasury',
  token: 'Token',
  auction: 'Auction',
  metadata: 'MetadataRenderer',
} as const

type ContractName = keyof typeof contractNames

const contractOrder = Object.keys(contractNames) as ContractName[]

const formatContractList = (contracts: ContractName[]) =>
  contracts.length > 0
    ? contracts.map((contract) => contractNames[contract]).join(', ')
    : 'None'

export const getUpgradedContracts = (
  transactions: Transaction[],
  addresses: DaoContractAddresses
): ContractName[] =>
  contractOrder.filter((contract) =>
    transactions.some(
      (transaction) =>
        transaction.functionSignature === 'upgradeTo(address)' &&
        transaction.target.toLowerCase() === addresses[contract]?.toLowerCase()
    )
  )

export const isGovernorUpgrade = (
  transactions: Transaction[],
  addresses: DaoContractAddresses
) => getUpgradedContracts(transactions, addresses).includes('governor')

export const replaceV3SummaryContractDetails = (
  summary: string,
  transactions: Transaction[],
  addresses: DaoContractAddresses
) => {
  const upgradedContracts = getUpgradedContracts(transactions, addresses)
  const unchangedContracts = contractOrder.filter(
    (contract) => !upgradedContracts.includes(contract)
  )

  return summary
    .replace(/\{\{UPGRADED_CONTRACTS\}\}/g, formatContractList(upgradedContracts))
    .replace(/\{\{UNCHANGED_CONTRACTS\}\}/g, formatContractList(unchangedContracts))
    .replace(
      /\{\{GOVERNOR_CONFIGURATION\}\}/g,
      upgradedContracts.includes('governor')
        ? "The Governor's updatable proposal period is set to {{UPDATABLE_PERIOD}} as part of this proposal."
        : "This proposal does not change the Governor's updatable proposal period."
    )
}
