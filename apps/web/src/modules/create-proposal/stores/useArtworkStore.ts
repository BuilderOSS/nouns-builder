import { ArtworkType, IPFSUpload, OrderedTraits } from '@buildeross/types'
import { create } from 'zustand'

export interface ArtworkFormValues {
  artwork: Array<ArtworkType>
  filesLength: number | string
}

export interface ArtworkStore {
  setUpArtwork: ArtworkFormValues
  setSetUpArtwork: (artwork: ArtworkFormValues) => void
  ipfsUpload: IPFSUpload[]
  setIpfsUpload: (ipfsUpload: IPFSUpload[]) => void
  orderedLayers: OrderedTraits
  setOrderedLayers: (orderedLayers: OrderedTraits) => void
  isUploadingToIPFS: boolean
  setIsUploadingToIPFS: (bool: boolean) => void
  ipfsUploadProgress: number
  setIpfsUploadProgress: (progress: number) => void
  resetForm: () => void
}

const initialState = {
  setUpArtwork: {
    artwork: [],
    filesLength: '',
  },
  ipfsUpload: [],
  orderedLayers: [],
  isUploadingToIPFS: false,
  ipfsUploadProgress: 0,
}

export const useArtworkStore = create<ArtworkStore>((set) => ({
  ...initialState,
  setSetUpArtwork: (artwork: ArtworkFormValues) => set({ setUpArtwork: artwork }),
  setIpfsUpload: (ipfsUpload: IPFSUpload[]) => set({ ipfsUpload }),
  setOrderedLayers: (orderedLayers: OrderedTraits) => {
    set({
      orderedLayers,
    })
  },
  setIsUploadingToIPFS: (isUploadingToIPFS: boolean) => set({ isUploadingToIPFS }),
  setIpfsUploadProgress: (progress: number) => set({ ipfsUploadProgress: progress }),
  resetForm: () => set({ ...initialState }),
}))
