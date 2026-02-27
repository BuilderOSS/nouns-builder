import { Bytes, ethereum, store } from '@graphprotocol/graph-ts'

import { DAO, DAOTokenOwner, DAOVoter, Snapshot, Token } from '../generated/schema'
import {
  DelegateChanged as DelegateChangedEvent,
  Token as TokenContract,
  Transfer as TransferEvent,
} from '../generated/templates/Token/Token'
import { ADDRESS_ZERO } from './utils/constants'
import { setTokenMetadata } from './utils/setTokenMetadata'

function getOrCreateZeroAddressOwner(daoAddress: Bytes): DAOTokenOwner {
  let zeroOwnerId = `${daoAddress.toHexString()}:${ADDRESS_ZERO.toHexString()}`
  let zeroOwner = DAOTokenOwner.load(zeroOwnerId)

  if (!zeroOwner) {
    zeroOwner = new DAOTokenOwner(zeroOwnerId)
    zeroOwner.dao = daoAddress.toHexString()
    zeroOwner.owner = ADDRESS_ZERO
    zeroOwner.delegate = ADDRESS_ZERO
    zeroOwner.daoTokenCount = 0
    zeroOwner.save()
  }

  return zeroOwner
}

function getOrCreateZeroAddressVoter(daoAddress: Bytes): DAOVoter {
  let zeroVoterId = `${daoAddress.toHexString()}:${ADDRESS_ZERO.toHexString()}`
  let zeroVoter = DAOVoter.load(zeroVoterId)

  if (!zeroVoter) {
    zeroVoter = new DAOVoter(zeroVoterId)
    zeroVoter.dao = daoAddress.toHexString()
    zeroVoter.voter = ADDRESS_ZERO
    zeroVoter.daoTokenCount = 0
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
  if (!tokenOwner) {
    tokenOwner = new DAOTokenOwner(tokenOwnerId)
    tokenOwner.dao = event.address.toHexString()
    tokenOwner.owner = owner
  }

  tokenOwner.daoTokenCount = tokenContract.balanceOf(owner).toI32()
  tokenOwner.delegate = newDelegate
  tokenOwner.save()

  let newDelegateVoterId = `${event.address.toHexString()}:${newDelegate.toHexString()}`

  let newDelegateVoter = DAOVoter.load(newDelegateVoterId)
  let isNewVoter = false
  if (!newDelegateVoter) {
    newDelegateVoter = new DAOVoter(newDelegateVoterId)
    newDelegateVoter.daoTokenCount = 0
    newDelegateVoter.dao = event.address.toHexString()
    newDelegateVoter.voter = newDelegate
    isNewVoter = true
  }

  let newTokenCount = newDelegateVoter.daoTokenCount + tokenOwner.daoTokenCount
  newDelegateVoter.daoTokenCount = newTokenCount
  newDelegateVoter.save()

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

  // Handle loading token data on first transfer
  if (!token) {
    token = new Token(tokenId)

    let tokenURI = tokenContract.try_tokenURI(event.params.tokenId)

    token.name = `${tokenContract.name()} #${event.params.tokenId.toString()}`
    if (!tokenURI.reverted) setTokenMetadata(token, tokenURI.value)

    token.tokenContract = event.address
    token.tokenId = event.params.tokenId
    token.mintedAt = event.block.timestamp
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
      dao.ownerCount = dao.ownerCount + 1
    } else toOwner.daoTokenCount = toOwner.daoTokenCount + 1

    toOwner.delegate = toDelegate
    toOwner.save()

    token.ownerInfo = toOwnerId
  } else {
    // Handle burning - point to zero address owner
    let zeroOwner = getOrCreateZeroAddressOwner(event.address)
    token.ownerInfo = zeroOwner.id
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
      dao.voterCount = dao.voterCount + 1
    } else toVoter.daoTokenCount = toVoter.daoTokenCount + 1

    toVoter.save()

    token.voterInfo = toVoterId
  } else {
    // Handle burning - point to zero address voter
    let zeroVoter = getOrCreateZeroAddressVoter(event.address)
    token.voterInfo = zeroVoter.id
  }

  token.save()

  // Handle loading from owner
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromOwnerId = `${event.address.toHexString()}:${event.params.from.toHexString()}`
    let fromOwner = DAOTokenOwner.load(fromOwnerId)
    if (fromOwner) {
      let fromOwnerTokenCount = fromOwner.daoTokenCount - 1
      fromOwner.daoTokenCount = fromOwnerTokenCount
      fromOwner.delegate = fromDelegate
      fromOwner.save()

      if (fromOwnerTokenCount == 0) {
        store.remove('DAOTokenOwner', fromOwnerId)
        dao.ownerCount = dao.ownerCount - 1
      }
    }
  }

  if (fromDelegate.notEqual(ADDRESS_ZERO)) {
    let fromVoterId = `${event.address.toHexString()}:${fromDelegate.toHexString()}`
    let fromVoter = DAOVoter.load(fromVoterId)
    if (fromVoter) {
      let fromDelegateTokenCount = fromVoter.daoTokenCount - 1
      fromVoter.daoTokenCount = fromDelegateTokenCount
      fromVoter.save()

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
