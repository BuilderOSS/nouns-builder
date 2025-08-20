import { useIsContract } from '@buildeross/hooks'
import { omit } from 'lodash'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'

export const useBridgeModal = () => {
  const router = useRouter()

  const { address } = useAccount()
  const { data: isContractWallet } = useIsContract({ address })

  const openBridgeModal = () => {
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
  }

  const closeBridgeModal = () => {
    router.push(
      {
        pathname: router.pathname,
        query: omit(router.query, ['bridge']),
      },
      undefined,
      { shallow: true }
    )
  }

  return {
    canUserBridge: !isContractWallet,
    openBridgeModal,
    closeBridgeModal,
  }
}
