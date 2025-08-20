import { useIsContract } from '@buildeross/hooks'
import omit from 'lodash/omit'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'

export const useBridgeModal = () => {
  const router = useRouter()

  const { address, chainId } = useAccount()

  const openBridgeModal = useCallback(() => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          bridge: true,
        },
      },
      undefined,
      { shallow: true }
    )
  }, [router])

  const closeBridgeModal = useCallback(() => {
    router.replace(
      {
        pathname: router.pathname,
        query: omit(router.query, ['bridge']),
      },
      undefined,
      { shallow: true }
    )
  }, [router])

  const isContractResponse = useIsContract({ address, chainId })

  const canUserBridge = useMemo(
    () => isContractResponse.data === false && isContractResponse.isLoading === false,
    [isContractResponse.data, isContractResponse.isLoading]
  )

  const isBridgeModalOpen = useMemo(
    () => router.query.bridge != null,
    [router.query.bridge]
  )

  return {
    canUserBridge,
    isBridgeModalOpen,
    openBridgeModal,
    closeBridgeModal,
  }
}
