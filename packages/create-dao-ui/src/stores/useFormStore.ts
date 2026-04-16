import type { DaoContractAddresses } from '@buildeross/stores'
import type { IPFSUpload, OrderedTraits } from '@buildeross/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  ArtworkFormValues,
  AuctionSettingsFormValues,
  GeneralFormValues,
  TokenAllocation,
} from '../components'

export interface FormStoreState {
  activeSection: number
  setActiveSection: (activeSection: number) => void
  fulfilledSections: string[]
  setFulfilledSections: (section: string) => void
  general: GeneralFormValues
  setGeneral: (general: GeneralFormValues) => void
  vetoPower: boolean | undefined
  setVetoPower: (vetoPower: boolean) => void
  vetoerAddress: string
  setVetoerAddress: (vetoerAddress: string) => void
  founderAllocation: Array<TokenAllocation>
  setFounderAllocation: (founderAllocation: Array<TokenAllocation>) => void
  contributionAllocation: Array<TokenAllocation>
  setContributionAllocation: (contributionAllocation: Array<TokenAllocation>) => void
  auctionSettings: AuctionSettingsFormValues
  setAuctionSettings: (auctionSettings: AuctionSettingsFormValues) => void
  enableFastDAO: boolean
  setEnableFastDAO: (enableFastDAO: boolean) => void
  setUpArtwork: ArtworkFormValues
  setSetUpArtwork: (artwork: ArtworkFormValues) => void
  ipfsUpload: IPFSUpload[]
  setIpfsUpload: (ipfsUpload: IPFSUpload[]) => void
  deployedDao: DaoContractAddresses
  setDeployedDao: (deployedDao: DaoContractAddresses) => void
  orderedLayers: OrderedTraits
  setOrderedLayers: (orderedLayers: OrderedTraits) => void
  isUploadingToIPFS: boolean
  setIsUploadingToIPFS: (bool: boolean) => void
  ipfsUploadProgress: number
  setIpfsUploadProgress: (ipfsUploadProgress: number) => void
  founderRewardRecipient: string
  setFounderRewardRecipient: (founderRewardRecipient: string) => void
  founderRewardBps: number
  setFounderRewardBps: (founderRewardBps: number) => void
  reservedUntilTokenId: string
  setReservedUntilTokenId: (reservedUntilTokenId: string) => void
  resetForm: () => void
}

const initialState = {
  activeSection: 0,
  fulfilledSections: [],
  general: {
    daoAvatar: '',
    daoName: '',
    daoSymbol: '',
    daoWebsite: '',
    projectDescription: '',
    links: [],
  },
  auctionSettings: {
    auctionDuration: {
      seconds: undefined,
      days: 1,
      hours: undefined,
      minutes: undefined,
    },
    auctionReservePrice: undefined,
    proposalThreshold: undefined,
    quorumThreshold: undefined,
    votingDelay: {
      seconds: undefined,
      days: 1,
      hours: undefined,
      minutes: undefined,
    },
    votingPeriod: {
      seconds: undefined,
      days: 4,
      hours: undefined,
      minutes: undefined,
    },
    timelockDelay: {
      seconds: undefined,
      days: 2,
      hours: undefined,
      minutes: undefined,
    },
  },
  enableFastDAO: false,
  reservedUntilTokenId: '0',
  founderAllocation: [],
  contributionAllocation: [],
  vetoPower: undefined,
  vetoerAddress: '',
  founderRewardRecipient: '',
  founderRewardBps: 0,
  setUpArtwork: {
    artwork: [],
    collectionName: '',
    externalUrl: '',
    filesLength: '',
    fileType: '',
  },
  ipfsUpload: [],
  orderedLayers: [],
  ipfsUploadProgress: 0,
  isUploadingToIPFS: false,
  deployedDao: {
    token: undefined,
    metadata: undefined,
    auction: undefined,
    treasury: undefined,
    governor: undefined,
  },
}

export const useFormStore = create(
  persist<FormStoreState>(
    (set) => ({
      ...initialState,
      setActiveSection: (activeSection) => set({ activeSection }),
      setFulfilledSections: (section: string) => {
        set((state) => ({
          fulfilledSections: !state.fulfilledSections.includes(section)
            ? [...state.fulfilledSections, section]
            : [...state.fulfilledSections],
        }))
      },
      setGeneral: (general: GeneralFormValues) => set({ general }),
      setAuctionSettings: (auctionSettings: AuctionSettingsFormValues) =>
        set({ auctionSettings }),
      setEnableFastDAO: (enableFastDAO: boolean) => set({ enableFastDAO }),
      setFounderAllocation: (founderAllocation: Array<TokenAllocation>) =>
        set({ founderAllocation }),
      setContributionAllocation: (contributionAllocation: Array<TokenAllocation>) =>
        set({ contributionAllocation }),
      setVetoPower: (vetoPower: boolean) => set({ vetoPower }),
      setVetoerAddress: (vetoerAddress: string) => set({ vetoerAddress }),
      setFounderRewardRecipient: (founderRewardRecipient: string) =>
        set({ founderRewardRecipient }),
      setFounderRewardBps: (founderRewardBps: number) => set({ founderRewardBps }),
      setReservedUntilTokenId: (reservedUntilTokenId: string) =>
        set({ reservedUntilTokenId }),
      setSetUpArtwork: (artwork: ArtworkFormValues) => set({ setUpArtwork: artwork }),
      setIpfsUpload: (ipfsUpload: IPFSUpload[]) => set({ ipfsUpload }),
      setOrderedLayers: (orderedLayers: OrderedTraits) => {
        set({
          orderedLayers,
        })
      },
      setIpfsUploadProgress: (ipfsUploadProgress: number) => set({ ipfsUploadProgress }),
      setIsUploadingToIPFS: (isUploadingToIPFS: boolean) => set({ isUploadingToIPFS }),
      setDeployedDao: (deployedDao: DaoContractAddresses) => {
        set({
          deployedDao,
        })
      },
      resetForm: () => set({ ...initialState }),
    }),
    {
      name: `nouns-builder-create-${process.env.NEXT_PUBLIC_NETWORK_TYPE}`,
      storage: createJSONStorage(() => localStorage),
      // Version history note: v3 was used for an intermediate links migration;
      // current v4 keeps sequential guards (<2, <3, <4) so older persisted states
      // still migrate correctly through each step.
      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 2 && persistedState?.setUpArtwork !== undefined) {
          persistedState = {
            ...persistedState,
            setUpArtwork: {
              ...persistedState.setUpArtwork,
              fileType: persistedState.setUpArtwork.fileType ?? '',
            },
          }
        }

        if (version < 3 && persistedState?.setUpArtwork !== undefined) {
          persistedState = {
            ...persistedState,
            setUpArtwork: {
              ...persistedState.setUpArtwork,
              links: persistedState.setUpArtwork.links ?? [],
            },
          }
        }

        if (version < 4) {
          const migratedDescription =
            persistedState?.general?.projectDescription ||
            persistedState?.setUpArtwork?.projectDescription ||
            ''
          const migratedLinks =
            persistedState?.general?.links ?? persistedState?.setUpArtwork?.links ?? []

          return {
            ...persistedState,
            general: {
              ...persistedState?.general,
              projectDescription: migratedDescription,
              links: migratedLinks,
            },
          }
        }

        return persistedState
      },
    }
  )
)
