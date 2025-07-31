import { Bytes, ethereum, store } from '@graphprotocol/graph-ts'

import { DAO, DAOTokenOwner, DAOVoter, Snapshot, Token } from '../generated/schema'
import {
  DelegateChanged as DelegateChangedEvent,
  Transfer as TransferEvent,
} from '../generated/templates/Token/Token'
import { Token as TokenContract } from '../generated/templates/Token/Token'
import { setTokenMetadata } from './utils/setTokenMetadata'

let ADDRESS_ZERO = Bytes.fromHexString('0x0000000000000000000000000000000000000000')

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  let owner = event.params.delegator
  let prevDelegate = event.params.from
  let newDelegate = event.params.to

  let tokenOwnerId = `${event.address.toHexString()}:${owner.toHexString()}`

  let tokenOwner = DAOTokenOwner.load(tokenOwnerId)
  if (!tokenOwner) {
    tokenOwner = new DAOTokenOwner(tokenOwnerId)
    tokenOwner.daoTokenCount = 0
    tokenOwner.dao = event.address.toHexString()
    tokenOwner.owner = owner
  }

  tokenOwner.delegate = newDelegate
  tokenOwner.save()

  let newDelegateVoterId = `${event.address.toHexString()}:${newDelegate.toHexString()}`

  let newDelegateVoter = DAOVoter.load(newDelegateVoterId)
  if (!newDelegateVoter) {
    newDelegateVoter = new DAOVoter(newDelegateVoterId)
    newDelegateVoter.daoTokenCount = 0
    newDelegateVoter.dao = event.address.toHexString()
    newDelegateVoter.voter = newDelegate
  }

  newDelegateVoter.daoTokenCount =
    newDelegateVoter.daoTokenCount + tokenOwner.daoTokenCount
  newDelegateVoter.save()

  let prevDelegateVoterId = `${event.address.toHexString()}:${prevDelegate.toHexString()}`
  let prevDelegateVoter = DAOVoter.load(prevDelegateVoterId)
  if (prevDelegateVoter) {
    let daoTokenCount = prevDelegateVoter.daoTokenCount - tokenOwner.daoTokenCount

    if (daoTokenCount > 0) {
      prevDelegateVoter.daoTokenCount = daoTokenCount
      prevDelegateVoter.save()
    } else {
      store.remove('DAOVoter', prevDelegateVoterId)
    }
  }

  let tokens = tokenOwner.daoTokens.load()

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    token.voterInfo = newDelegateVoterId
    token.save()
  }

  saveSnapshot(event)
}

export function handleTransfer(event: TransferEvent): void {
  let tokenId = `${event.address.toHexString()}:${event.params.tokenId.toString()}`
  let token = Token.load(tokenId)
  let dao = DAO.load(event.address.toHexString())!

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
  }

  token.owner = event.params.to
  token.ownerInfo = `${event.address.toHexString()}:${event.params.to.toHexString()}`
  token.voterInfo = `${event.address.toHexString()}:${toDelegate.toHexString()}`

  token.save()

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
  } else {
    // Handle burning
    dao.totalSupply = dao.totalSupply - 1
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
  }

  // Handle loading from owner
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromOwnerId = `${event.address.toHexString()}:${event.params.from.toHexString()}`
    let fromOwner = DAOTokenOwner.load(fromOwnerId)!
    if (fromOwner) {
      if (fromOwner.daoTokenCount === 1) {
        store.remove('DAOTokenOwner', fromOwnerId)
        dao.ownerCount = dao.ownerCount - 1
      } else {
        fromOwner.daoTokenCount = fromOwner.daoTokenCount - 1
        fromOwner.delegate = fromDelegate
        fromOwner.save()
      }
    }
  }

  if (fromDelegate.notEqual(ADDRESS_ZERO)) {
    let fromVoterId = `${event.address.toHexString()}:${fromDelegate.toHexString()}`
    let fromVoter = DAOVoter.load(fromVoterId)!
    if (fromVoter) {
      if (fromVoter.daoTokenCount === 1) {
        store.remove('DAOVoter', fromVoterId)
        dao.voterCount = dao.voterCount - 1
      } else {
        fromVoter.daoTokenCount = fromVoter.daoTokenCount - 1
        fromVoter.save()
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

  let dao = DAO.load(event.address.toHexString())!
  snapshot.totalSupply = dao.totalSupply
  snapshot.ownerCount = dao.ownerCount
  snapshot.voterCount = dao.voterCount
  snapshot.proposalCount = dao.proposalCount
  snapshot.save()
}
