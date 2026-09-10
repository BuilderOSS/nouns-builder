import { BigInt, Bytes, ethereum, store } from '@graphprotocol/graph-ts'

import {
  DAO,
  DAOTokenOwner,
  DAOVoter,
  Profile,
  Snapshot,
  Token,
} from '../generated/schema'
import {
  DelegateChanged as DelegateChangedEvent,
  Token as TokenContract,
  Transfer as TransferEvent,
} from '../generated/templates/Token/Token'
import { ADDRESS_ZERO } from './utils/constants'
import { getOrCreateProfile, touchProfile } from './utils/profile'
import { setTokenMetadata } from './utils/setTokenMetadata'

function getOrCreateZeroAddressOwner(
  daoAddress: Bytes,
  timestamp: BigInt
): DAOTokenOwner {
  let zeroOwnerId = `${daoAddress.toHexString()}:${ADDRESS_ZERO.toHexString()}`
  let zeroOwner = DAOTokenOwner.load(zeroOwnerId)

  if (!zeroOwner) {
    zeroOwner = new DAOTokenOwner(zeroOwnerId)
    zeroOwner.dao = daoAddress.toHexString()
    zeroOwner.owner = ADDRESS_ZERO
    zeroOwner.delegate = ADDRESS_ZERO
    zeroOwner.daoTokenCount = 0
    zeroOwner.lastActiveAt = timestamp
    zeroOwner.save()
  }

  return zeroOwner
}

function getOrCreateZeroAddressVoter(daoAddress: Bytes, timestamp: BigInt): DAOVoter {
  let zeroVoterId = `${daoAddress.toHexString()}:${ADDRESS_ZERO.toHexString()}`
  let zeroVoter = DAOVoter.load(zeroVoterId)

  if (!zeroVoter) {
    zeroVoter = new DAOVoter(zeroVoterId)
    zeroVoter.dao = daoAddress.toHexString()
    zeroVoter.voter = ADDRESS_ZERO
    zeroVoter.daoTokenCount = 0
    zeroVoter.lastActiveAt = timestamp
    zeroVoter.save()
  }

  return zeroVoter
}

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  if (event.params.from.equals(event.params.to)) return

  let owner = event.params.delegator
  let prevDelegate = event.params.from
  let newDelegate = event.params.to

  let dao = DAO.load(event.address.toHexString())
  if (dao == null) {
    return
  }

  let tokenOwnerId = `${event.address.toHexString()}:${owner.toHexString()}`

  let tokenContract = TokenContract.bind(event.address)
  let tokenOwner = DAOTokenOwner.load(tokenOwnerId)
  let ownerProfile = getOrCreateProfile(owner, event.block.timestamp)
  if (!tokenOwner) {
    tokenOwner = new DAOTokenOwner(tokenOwnerId)
    tokenOwner.dao = event.address.toHexString()
    tokenOwner.owner = owner
    tokenOwner.profile = ownerProfile.id
    tokenOwner.lastActiveAt = event.block.timestamp
    ownerProfile.ownerDaoCount = ownerProfile.ownerDaoCount + 1
  }

  tokenOwner.daoTokenCount = tokenContract.balanceOf(owner).toI32()
  tokenOwner.profile = ownerProfile.id
  tokenOwner.delegate = newDelegate
  tokenOwner.lastActiveAt = event.block.timestamp
  tokenOwner.save()
  touchProfile(ownerProfile, event.block.timestamp)
  ownerProfile.save()

  let newDelegateVoterId = `${event.address.toHexString()}:${newDelegate.toHexString()}`

  let newDelegateVoter = DAOVoter.load(newDelegateVoterId)
  let isNewVoter = false
  let newDelegateProfile = getOrCreateProfile(newDelegate, event.block.timestamp)
  if (!newDelegateVoter) {
    newDelegateVoter = new DAOVoter(newDelegateVoterId)
    newDelegateVoter.daoTokenCount = 0
    newDelegateVoter.dao = event.address.toHexString()
    newDelegateVoter.voter = newDelegate
    newDelegateVoter.profile = newDelegateProfile.id
    newDelegateVoter.lastActiveAt = event.block.timestamp
    newDelegateProfile.voterDaoCount = newDelegateProfile.voterDaoCount + 1
    isNewVoter = true
  }

  let newTokenCount = newDelegateVoter.daoTokenCount + tokenOwner.daoTokenCount
  newDelegateVoter.daoTokenCount = newTokenCount
  newDelegateVoter.profile = newDelegateProfile.id
  newDelegateVoter.lastActiveAt = event.block.timestamp
  newDelegateVoter.save()
  touchProfile(newDelegateProfile, event.block.timestamp)
  newDelegateProfile.save()

  let tokens = tokenOwner.daoTokens.load()

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    token.voterInfo = newDelegateVoterId
    token.save()
  }

  let prevDelegateVoterId = `${event.address.toHexString()}:${prevDelegate.toHexString()}`
  let prevDelegateVoter = DAOVoter.load(prevDelegateVoterId)
  let isVoterRemoved = false
  if (prevDelegateVoter) {
    let prevTokenCount = prevDelegateVoter.daoTokenCount - tokenOwner.daoTokenCount
    prevDelegateVoter.daoTokenCount = prevTokenCount
    prevDelegateVoter.save()

    let prevDelegateProfile = Profile.load(prevDelegate.toHexString())
    if (prevDelegateProfile) {
      touchProfile(prevDelegateProfile, event.block.timestamp)
      if (prevTokenCount == 0) {
        prevDelegateProfile.voterDaoCount = prevDelegateProfile.voterDaoCount - 1
      }
      prevDelegateProfile.save()
    }

    if (prevTokenCount == 0) {
      store.remove('DAOVoter', prevDelegateVoterId)
      isVoterRemoved = true
    }
  }

  // Update voterCount: net change = new voters created - old voters removed
  if (isNewVoter && !isVoterRemoved) {
    dao.voterCount = dao.voterCount + 1
  } else if (!isNewVoter && isVoterRemoved) {
    dao.voterCount = dao.voterCount - 1
  }
  // If both created and removed, or neither, voterCount stays the same

  dao.save()
  saveSnapshot(event)
}

export function handleTransfer(event: TransferEvent): void {
  if (event.params.from.equals(event.params.to)) return

  let tokenId = `${event.address.toHexString()}:${event.params.tokenId.toString()}`
  let token = Token.load(tokenId)
  let dao = DAO.load(event.address.toHexString())
  if (dao == null) {
    return
  }

  let tokenContract = TokenContract.bind(event.address)
  let fromDelegate = tokenContract.delegates(event.params.from)
  let toDelegate = tokenContract.delegates(event.params.to)
  let toProfile = event.params.to.notEqual(ADDRESS_ZERO)
    ? getOrCreateProfile(event.params.to, event.block.timestamp)
    : null
  // Reuse toProfile if toDelegate is the same address
  let toDelegateProfile =
    toDelegate.notEqual(ADDRESS_ZERO) && toProfile && toDelegate.equals(event.params.to)
      ? toProfile
      : toDelegate.notEqual(ADDRESS_ZERO)
        ? getOrCreateProfile(toDelegate, event.block.timestamp)
        : null
  let fromProfile = event.params.from.notEqual(ADDRESS_ZERO)
    ? getOrCreateProfile(event.params.from, event.block.timestamp)
    : null

  // Handle loading token data on first transfer
  if (!token) {
    token = new Token(tokenId)

    let tokenURI = tokenContract.try_tokenURI(event.params.tokenId)

    token.name = `${tokenContract.name()} #${event.params.tokenId.toString()}`
    if (!tokenURI.reverted) setTokenMetadata(token, tokenURI.value)

    token.tokenContract = event.address
    token.tokenId = event.params.tokenId
    token.mintedAt = event.block.timestamp
    token.mintTransactionHash = event.transaction.hash
    token.dao = event.address.toHexString()

    dao.totalSupply = dao.totalSupply + 1
    dao.tokensCount = dao.tokensCount + 1
  }

  token.owner = event.params.to

  // Handle loading to owner
  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toOwnerId = `${event.address.toHexString()}:${event.params.to.toHexString()}`
    let toOwner = DAOTokenOwner.load(toOwnerId)
    if (!toOwner) {
      toOwner = new DAOTokenOwner(toOwnerId)
      toOwner.daoTokenCount = 1
      toOwner.dao = event.address.toHexString()
      toOwner.owner = event.params.to
      toOwner.profile = toProfile ? toProfile.id : null
      toOwner.lastActiveAt = event.block.timestamp
      dao.ownerCount = dao.ownerCount + 1
      if (toProfile) {
        toProfile.ownerDaoCount = toProfile.ownerDaoCount + 1
      }
    } else toOwner.daoTokenCount = toOwner.daoTokenCount + 1

    toOwner.delegate = toDelegate
    toOwner.lastActiveAt = event.block.timestamp
    if (toProfile) {
      toOwner.profile = toProfile.id
      touchProfile(toProfile, event.block.timestamp)
      toProfile.tokenCount = toProfile.tokenCount + 1
      toProfile.save()
    }
    toOwner.save()

    token.ownerInfo = toOwnerId
    token.profile = toProfile ? toProfile.id : null
  } else {
    // Handle burning - point to zero address owner
    let zeroOwner = getOrCreateZeroAddressOwner(event.address, event.block.timestamp)
    token.ownerInfo = zeroOwner.id
    token.profile = null
    dao.totalSupply = dao.totalSupply - 1
    // totalSupply decreases but tokensCount stays the same
  }

  if (toDelegate.notEqual(ADDRESS_ZERO)) {
    let toVoterId = `${event.address.toHexString()}:${toDelegate.toHexString()}`
    let toVoter = DAOVoter.load(toVoterId)
    if (!toVoter) {
      toVoter = new DAOVoter(toVoterId)
      toVoter.daoTokenCount = 1
      toVoter.dao = event.address.toHexString()
      toVoter.voter = toDelegate
      toVoter.profile = toDelegateProfile ? toDelegateProfile.id : null
      toVoter.lastActiveAt = event.block.timestamp
      dao.voterCount = dao.voterCount + 1
      if (toDelegateProfile) {
        toDelegateProfile.voterDaoCount = toDelegateProfile.voterDaoCount + 1
      }
    } else toVoter.daoTokenCount = toVoter.daoTokenCount + 1

    toVoter.lastActiveAt = event.block.timestamp
    if (toDelegateProfile) {
      toVoter.profile = toDelegateProfile.id
      touchProfile(toDelegateProfile, event.block.timestamp)
      toDelegateProfile.save()
    }
    toVoter.save()

    token.voterInfo = toVoterId
  } else {
    // Handle burning - point to zero address voter
    let zeroVoter = getOrCreateZeroAddressVoter(event.address, event.block.timestamp)
    token.voterInfo = zeroVoter.id
  }

  token.save()

  // Decrement tokenCount from the previous owner's profile (if not a mint)
  // Always use fromProfile (the actual sender) rather than the token's cached profile reference
  if (fromProfile) {
    touchProfile(fromProfile, event.block.timestamp)
    if (fromProfile.tokenCount > 0) {
      fromProfile.tokenCount = fromProfile.tokenCount - 1
    }
  }

  // Handle loading from owner
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromOwnerId = `${event.address.toHexString()}:${event.params.from.toHexString()}`
    let fromOwner = DAOTokenOwner.load(fromOwnerId)
    if (fromOwner) {
      let fromOwnerTokenCount = fromOwner.daoTokenCount - 1
      fromOwner.daoTokenCount = fromOwnerTokenCount
      fromOwner.delegate = fromDelegate
      fromOwner.lastActiveAt = event.block.timestamp
      fromOwner.save()

      if (fromOwnerTokenCount == 0) {
        if (fromProfile && fromProfile.ownerDaoCount > 0) {
          fromProfile.ownerDaoCount = fromProfile.ownerDaoCount - 1
        }
        store.remove('DAOTokenOwner', fromOwnerId)
        dao.ownerCount = dao.ownerCount - 1
      }
    }
  }

  // Save fromProfile after all updates
  if (fromProfile) {
    fromProfile.save()
  }

  // Load fromDelegateProfile AFTER saving fromProfile to avoid overwriting
  let fromDelegateProfile = fromDelegate.notEqual(ADDRESS_ZERO)
    ? Profile.load(fromDelegate.toHexString())
    : null

  if (fromDelegate.notEqual(ADDRESS_ZERO)) {
    let fromVoterId = `${event.address.toHexString()}:${fromDelegate.toHexString()}`
    let fromVoter = DAOVoter.load(fromVoterId)
    if (fromVoter) {
      let fromDelegateTokenCount = fromVoter.daoTokenCount - 1
      fromVoter.daoTokenCount = fromDelegateTokenCount
      fromVoter.lastActiveAt = event.block.timestamp
      fromVoter.save()

      if (fromDelegateProfile) {
        touchProfile(fromDelegateProfile, event.block.timestamp)
        if (fromDelegateTokenCount == 0) {
          fromDelegateProfile.voterDaoCount = fromDelegateProfile.voterDaoCount - 1
        }
        fromDelegateProfile.save()
      }

      if (fromDelegateTokenCount == 0) {
        store.remove('DAOVoter', fromVoterId)
        dao.voterCount = dao.voterCount - 1
      }
    }
  }

  dao.save()
  saveSnapshot(event)
}

function saveSnapshot(event: ethereum.Event): void {
  if (!event) {
    return
  }
  let snapshotId = `${event.address.toHexString()}:${event.block.number.toString()}`
  let snapshot = Snapshot.load(snapshotId)
  if (!snapshot) {
    snapshot = new Snapshot(snapshotId)
    snapshot.dao = event.address.toHexString()
    snapshot.blockNumber = event.block.number
    snapshot.timestamp = event.block.timestamp
  }

  let dao = DAO.load(event.address.toHexString())
  if (!dao) return

  snapshot.totalSupply = dao.totalSupply
  snapshot.ownerCount = dao.ownerCount
  snapshot.voterCount = dao.voterCount
  snapshot.proposalCount = dao.proposalCount
  snapshot.tokensCount = dao.tokensCount
  snapshot.save()
}
