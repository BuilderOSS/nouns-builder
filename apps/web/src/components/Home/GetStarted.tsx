import { Button } from '@buildeross/zord'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useRouter } from 'next/router'
import React from 'react'
import { useChainStore } from 'src/stores'
import { marqueeButton } from 'src/styles/home.css'
import { useAccount, useSwitchChain } from 'wagmi'

const GetStarted = () => {
  const { address, chain: wagmiChain } = useAccount()
  const chain = useChainStore((x) => x.chain)

  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()

  const handleSwitchChain = () => switchChain({ chainId: chain.id })

  const { push } = useRouter()

  const handleClick = (): void => {
    push('/create')
  }

  return (
    <Button
      onClick={
        !address
          ? openConnectModal
          : wagmiChain?.id != chain.id
            ? handleSwitchChain
            : handleClick
      }
      h="x16"
      fontWeight={'display'}
      borderRadius={'curved'}
      fontSize={28}
      px={'x8'}
      py={'x4'}
      mt={'x8'}
      className={marqueeButton}
      backgroundColor={'onNeutral'}
      cursor={'pointer'}
      color={'onAccent'}
      width={'unset'}
      align={'center'}
      justify={'center'}
    >
      Create your DAO
    </Button>
  )
}

export default GetStarted
