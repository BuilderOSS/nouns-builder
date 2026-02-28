import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { CoinFormValues } from '../CoinForm/types'

export interface CoinFormStore {
  formValues: Partial<CoinFormValues>
  isUploadingToIPFS: boolean
  uploadProgress: number
  setFormValues: (values: Partial<CoinFormValues>) => void
  setIsUploadingToIPFS: (isUploading: boolean) => void
  setUploadProgress: (progress: number) => void
  resetForm: () => void
}

const initialState = {
  formValues: {},
  isUploadingToIPFS: false,
  uploadProgress: 0,
}

export const useCoinFormStore = create<CoinFormStore>()(
  persist(
    (set) => ({
      ...initialState,
      setFormValues: (values) =>
        set((state) => ({
          formValues: { ...state.formValues, ...values },
        })),
      setIsUploadingToIPFS: (isUploadingToIPFS) => set({ isUploadingToIPFS }),
      setUploadProgress: (uploadProgress) => set({ uploadProgress }),
      resetForm: () => set(() => ({ ...initialState })),
    }),
    {
      name: 'coin-form-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        formValues: state.formValues,
      }),
    }
  )
)
