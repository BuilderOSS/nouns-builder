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
  MINT_TOKENS = 5,
  SET_ATTRIBUTES = 6,
  CREATE_PROPOSAL = 7,
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
  memberSnapshot?: any[]
  merkleRoots?: MerkleRoots

  // Progress tracking
  metadataProgress: { current: number; total: number }
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
  setMemberSnapshot: (snapshot: any[]) => void
  setDeployTxHash: (hash: `0x${string}`) => void
  addMetadataTxHash: (hash: `0x${string}`) => void
  addMerkleRootTxHash: (hash: `0x${string}`) => void
  updateMetadataProgress: (current: number, total: number) => void
  updateMintingProgress: (progress: Partial<MintingProgress>) => void
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
  metadataProgress: { current: 0, total: 0 },
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

export const useCrossChainMigration = create<CrossChainMigrationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ currentStep: step }),

      setChains: (sourceChainId, targetChainId) => set({ sourceChainId, targetChainId }),

      setSourceAddresses: (addresses) => set({ sourceAddresses: addresses }),

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

      addMetadataTxHash: (hash) =>
        set((state) => ({
          metadataTxHashes: [...state.metadataTxHashes, hash],
        })),

      addMerkleRootTxHash: (hash) =>
        set((state) => ({
          merkleRootTxHashes: [...state.merkleRootTxHashes, hash],
        })),

      updateMetadataProgress: (current, total) =>
        set({ metadataProgress: { current, total } }),

      updateMintingProgress: (progress) =>
        set((state) => ({
          mintingProgress: {
            ...state.mintingProgress,
            ...progress,
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
      name: 'cross-chain-migration-storage',
      version: 1,
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str, bigIntReviver)
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value, bigIntReplacer))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
