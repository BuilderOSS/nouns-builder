import { Box } from '@buildeross/zord'
import React from 'react'

import {
  auctionCardSkeleton,
  daoCardSkeleton,
  proposalCardSkeleton,
} from './dashboard.css'

export const AuctionCardSkeleton = () => {
  return (
    <Box
      className={auctionCardSkeleton}
      borderRadius="curved"
      backgroundColor="background2"
      mb="x3"
    />
  )
}

export const DAOCardSkeleton = () => {
  return (
    <Box
      className={daoCardSkeleton}
      borderRadius="curved"
      backgroundColor="background2"
      mb="x3"
    />
  )
}

export const ProposalCardSkeleton = () => {
  return (
    <Box
      className={proposalCardSkeleton}
      borderRadius="curved"
      backgroundColor="background2"
      mb="x3"
    />
  )
}
