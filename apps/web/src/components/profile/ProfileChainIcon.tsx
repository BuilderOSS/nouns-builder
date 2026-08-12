import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import Image from 'next/image'
import React from 'react'
import { profileChainFallback, profileChainIcon } from 'src/styles/profile.css'

const chainsById = new Map(PUBLIC_DEFAULT_CHAINS.map((chain) => [chain.id, chain]))

export const getProfileChainMetadata = (chainId: number) => chainsById.get(chainId)

export const ProfileChainIcon: React.FC<{ chainId: number }> = ({ chainId }) => {
  const chain = getProfileChainMetadata(chainId)

  if (!chain)
    return (
      <span
        className={profileChainFallback}
        role="img"
        aria-label={`Unknown chain ${chainId}`}
        title={`Unknown chain ${chainId}`}
      >
        ?
      </span>
    )

  return (
    <Image
      className={profileChainIcon}
      src={chain.icon}
      alt={`${chain.name} network`}
      title={chain.name}
      width={18}
      height={18}
    />
  )
}
