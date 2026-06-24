import { DaoMember } from '@buildeross/sdk/subgraph'
import { DaoContractAddresses } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export enum MigrationStep {
  LOAD_CONFIG = 0,
  REVIEW_CONFIG = 1,
  DEPLOY_DAO = 2,
  SETUP_METADATA = 3,
  SETUP_MERKLE_ROOTS = 4,
  SET_DELAYED_GOVERNANCE = 5,
  MINT_TOKENS = 6,
  SET_ATTRIBUTES = 7,
  CREATE_PROPOSAL = 8,
}

// Alias for backwards compatibility
export const DeploymentStep = MigrationStep

export interface DAOConfigParams {
  name: string
  symbol: string
  description: string
  daoImage: string
  projectURI: string
  currentTokenId: bigint
  reservedUntilTokenId: bigint
  metadataRenderer: AddressType
  founders: Array<{
    wallet: AddressType
    ownershipPct: number
    vestExpiry: bigint
  }>
  duration: number
  reservePrice: bigint
  votingDelay: bigint
  votingPeriod: bigint
  proposalThresholdBps: bigint
  quorumThresholdBps: bigint
  vetoer: AddressType
  timelockDelay: bigint
}

export interface DeployedContracts {
  token?: AddressType
  metadata?: AddressType
  auction?: AddressType
  treasury?: AddressType
  governor?: AddressType
}

export interface MerkleRoots {
  attributes?: `0x${string}`
  members?: `0x${string}`
}

export interface MintingProgress {
  total: number
  minted: number[]
  failed: number[]
  txHashes: `0x${string}`[]
}

export interface ValidationResults {
  deployment: boolean
  metadata: boolean
  merkleRoots: boolean
  minting: boolean
  overall: boolean
  details?: Record<string, any>
}

export interface CrossChainMigrationState {
  // Current step
  currentStep: MigrationStep

  // Chain & DAO info
  sourceChainId?: CHAIN_ID
  targetChainId?: CHAIN_ID
  sourceAddresses?: DaoContractAddresses
  targetAddresses?: DeployedContracts

  // Configuration
  sourceConfig?: DAOConfigParams
  editedConfig?: Partial<DAOConfigParams>

  // Merkle data
  attributesData?: number[][]
  memberSnapshot?:
    | DaoMember[]
    | { ownerAlias: AddressType; owner: AddressType; tokens: number[] }[]
  merkleRoots?: MerkleRoots

  // Step 4: Metadata setup state
  metadataProperties?: string[]
  metadataProgress: { current: number; total: number }

  // Step 5: Merkle roots phase state
  merkleRootsPhase?: 'generate' | 'set_roots' | 'complete'

  // Step 6: Delayed governance state
  delayedGovernanceDuration?: {
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
  }
  delayedGovernanceTimestamp?: bigint
  delayedGovernanceTxHash?: `0x${string}`

  // Step 7: Minting progress
  mintingProgress: MintingProgress

  // Transaction hashes
  deployTxHash?: `0x${string}`
  metadataTxHashes: `0x${string}`[]
  merkleRootTxHashes: `0x${string}`[]

  // Validation
  validationResults?: ValidationResults

  // Actions
  setStep: (step: MigrationStep) => void
  setChains: (sourceChainId: CHAIN_ID, targetChainId: CHAIN_ID) => void
  setSourceAddresses: (addresses: DaoContractAddresses) => void
  setSourceConfig: (config: DAOConfigParams) => void
  updateConfig: (config: Partial<DAOConfigParams>) => void
  setTargetAddresses: (addresses: DeployedContracts) => void
  setMerkleRoots: (roots: Partial<MerkleRoots>) => void
  setAttributesMerkleRoot: (root: `0x${string}`) => void
  setMembersMerkleRoot: (root: `0x${string}`) => void
  setAttributesData: (data: number[][]) => void
  setMemberSnapshot: (
    snapshot:
      | DaoMember[]
      | { ownerAlias: AddressType; owner: AddressType; tokens: number[] }[]
  ) => void
  setDeployTxHash: (hash: `0x${string}`) => void

  // Step 4: Metadata actions
  setMetadataProperties: (properties: string[]) => void
  addMetadataTxHash: (hash: `0x${string}`) => void
  updateMetadataProgress: (current: number, total: number) => void

  // Step 5: Merkle roots actions
  setMerkleRootsPhase: (phase: 'generate' | 'set_roots' | 'complete') => void
  addMerkleRootTxHash: (hash: `0x${string}`) => void

  // Step 6: Delayed governance actions
  setDelayedGovernanceDuration: (duration: {
    days?: number
    hours?: number
    minutes?: number
    seconds?: number
  }) => void
  setDelayedGovernanceTimestamp: (timestamp: bigint) => void
  setDelayedGovernanceTxHash: (hash: `0x${string}`) => void

  // Step 7: Minting actions
  updateMintingProgress: (progress: Partial<MintingProgress>) => void
  addMintedTokens: (tokenIds: number[]) => void
  addMintingTxHash: (hash: `0x${string}`) => void

  setValidationResults: (results: ValidationResults) => void
  reset: () => void
  goToNextStep: () => void
  goToPreviousStep: () => void
}

const initialState = {
  currentStep: MigrationStep.LOAD_CONFIG,
  sourceChainId: undefined,
  targetChainId: undefined,
  sourceAddresses: undefined,
  targetAddresses: undefined,
  sourceConfig: undefined,
  editedConfig: undefined,
  attributesData: undefined,
  memberSnapshot: undefined,
  merkleRoots: undefined,
  metadataProperties: undefined,
  metadataProgress: { current: 0, total: 0 },
  merkleRootsPhase: undefined,
  delayedGovernanceDuration: undefined,
  delayedGovernanceTimestamp: undefined,
  delayedGovernanceTxHash: undefined,
  mintingProgress: { total: 0, minted: [], failed: [], txHashes: [] },
  deployTxHash: undefined,
  metadataTxHashes: [],
  merkleRootTxHashes: [],
  validationResults: undefined,
}

// Custom serializer to handle BigInt values
const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === 'bigint') {
    return { __type: 'bigint', value: value.toString() }
  }
  return value
}

// Custom deserializer to restore BigInt values
const bigIntReviver = (_key: string, value: any) => {
  if (value && typeof value === 'object' && value.__type === 'bigint') {
    return BigInt(value.value)
  }
  return value
}

// Helper to get the network type from environment
const getNetworkType = () => {
  if (typeof window === 'undefined') return 'mainnet'
  const nextPublicNetworkType = (window as any).__NEXT_PUBLIC_NETWORK_TYPE__
  return nextPublicNetworkType || process.env.NEXT_PUBLIC_NETWORK_TYPE || 'mainnet'
}

// Create a DAO-specific storage key
export const getMigrationStorageKey = (
  chainId?: CHAIN_ID,
  tokenAddress?: AddressType
) => {
  const networkType = getNetworkType()
  const baseKey = `cross-chain-migration:${networkType}`

  if (chainId && tokenAddress) {
    return `${baseKey}:${chainId}:${tokenAddress.toLowerCase()}`
  }

  // Fallback to temp key if DAO context not available yet
  return `${baseKey}:temp`
}

// Global variable to track current DAO context for storage
let currentStorageKey = getMigrationStorageKey()

// Function to update the storage key when DAO context changes
export const setMigrationDAOContext = (chainId: CHAIN_ID, tokenAddress: AddressType) => {
  const newKey = getMigrationStorageKey(chainId, tokenAddress)
  if (newKey !== currentStorageKey) {
    currentStorageKey = newKey
  }
}

export const useCrossChainMigration = create<CrossChainMigrationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      setChains: (sourceChainId, targetChainId) => {
        set({ sourceChainId, targetChainId })
        // Update storage key when source chain is set
        const addresses = get().sourceAddresses
        if (addresses?.token) {
          setMigrationDAOContext(sourceChainId, addresses.token)
        }
      },

      setSourceAddresses: (addresses) => {
        set({ sourceAddresses: addresses })
        // Update storage key when source addresses are set
        const chainId = get().sourceChainId
        if (chainId && addresses?.token) {
          setMigrationDAOContext(chainId, addresses.token)
        }
      },

      setSourceConfig: (config) =>
        set({
          sourceConfig: config,
          editedConfig: config,
        }),

      updateConfig: (config) =>
        set((state) => ({
          editedConfig: {
            ...state.editedConfig,
            ...config,
          },
        })),

      setTargetAddresses: (addresses) => set({ targetAddresses: addresses }),

      setMerkleRoots: (roots) =>
        set((state) => ({
          merkleRoots: {
            ...state.merkleRoots,
            ...roots,
          },
        })),

      setAttributesMerkleRoot: (root) =>
        set((state) => ({
          merkleRoots: {
            ...state.merkleRoots,
            attributes: root,
          },
        })),

      setMembersMerkleRoot: (root) =>
        set((state) => ({
          merkleRoots: {
            ...state.merkleRoots,
            members: root,
          },
        })),

      setAttributesData: (data) => set({ attributesData: data }),

      setMemberSnapshot: (snapshot) => set({ memberSnapshot: snapshot }),

      setDeployTxHash: (hash) => set({ deployTxHash: hash }),

      // Step 4: Metadata actions
      setMetadataProperties: (properties) => set({ metadataProperties: properties }),

      addMetadataTxHash: (hash) =>
        set((state) => ({
          metadataTxHashes: [...state.metadataTxHashes, hash],
        })),

      updateMetadataProgress: (current, total) =>
        set({ metadataProgress: { current, total } }),

      // Step 5: Merkle roots actions
      setMerkleRootsPhase: (phase) => set({ merkleRootsPhase: phase }),

      addMerkleRootTxHash: (hash) =>
        set((state) => ({
          merkleRootTxHashes: [...state.merkleRootTxHashes, hash],
        })),

      // Step 6: Delayed governance actions
      setDelayedGovernanceDuration: (duration) =>
        set({ delayedGovernanceDuration: duration }),

      setDelayedGovernanceTimestamp: (timestamp) =>
        set({ delayedGovernanceTimestamp: timestamp }),

      setDelayedGovernanceTxHash: (hash) => set({ delayedGovernanceTxHash: hash }),

      // Step 7: Minting actions
      updateMintingProgress: (progress) =>
        set((state) => ({
          mintingProgress: {
            ...state.mintingProgress,
            ...progress,
          },
        })),

      addMintedTokens: (tokenIds) =>
        set((state) => ({
          mintingProgress: {
            ...state.mintingProgress,
            minted: [...state.mintingProgress.minted, ...tokenIds],
          },
        })),

      addMintingTxHash: (hash) =>
        set((state) => ({
          mintingProgress: {
            ...state.mintingProgress,
            txHashes: [...state.mintingProgress.txHashes, hash],
          },
        })),

      setValidationResults: (results) => set({ validationResults: results }),

      reset: () => set(initialState),

      goToNextStep: () => {
        const currentStep = get().currentStep
        if (currentStep < MigrationStep.CREATE_PROPOSAL) {
          set({ currentStep: currentStep + 1 })
        }
      },

      goToPreviousStep: () => {
        const currentStep = get().currentStep
        if (currentStep > MigrationStep.LOAD_CONFIG) {
          set({ currentStep: currentStep - 1 })
        }
      },
    }),
    {
      name: 'cross-chain-migration-storage', // Base name, actual key is dynamic
      version: 4, // v4: Added SET_DELAYED_GOVERNANCE step and related state
      storage: {
        getItem: () => {
          // Use the current DAO-specific storage key
          const str = localStorage.getItem(currentStorageKey)
          if (!str) return null
          return JSON.parse(str, bigIntReviver)
        },
        setItem: (_name, value) => {
          // Use the current DAO-specific storage key
          localStorage.setItem(currentStorageKey, JSON.stringify(value, bigIntReplacer))
        },
        removeItem: (_name) => {
          // Use the current DAO-specific storage key
          localStorage.removeItem(currentStorageKey)
        },
      },
    }
  )
)
