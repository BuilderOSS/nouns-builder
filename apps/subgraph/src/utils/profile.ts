import { Address, BigInt } from '@graphprotocol/graph-ts'

import { Profile } from '../../generated/schema'

export function getOrCreateProfile(address: Address, timestamp: BigInt): Profile {
  let id = address.toHexString()
  let profile = Profile.load(id)

  if (!profile) {
    profile = new Profile(id)
    profile.address = address
    profile.createdAt = timestamp
    profile.tokenCount = 0
    profile.ownerDaoCount = 0
    profile.voterDaoCount = 0
    profile.proposalVotesCount = 0
    profile.proposalsSubmittedCount = 0
    profile.bidsPlacedCount = 0
    profile.auctionWinsCount = 0
  }

  profile.updatedAt = timestamp
  profile.lastActiveAt = timestamp
  return profile
}

export function touchProfile(profile: Profile, timestamp: BigInt): Profile {
  profile.updatedAt = timestamp
  profile.lastActiveAt = timestamp
  return profile
}
