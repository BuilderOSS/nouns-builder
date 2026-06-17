import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import {
  ClankerToken,
  ClankerTokenHolder,
  ClankerTokenLinkedEvent,
  ClankerTokenUnlinkedEvent,
} from '../generated/schema'
import { Transfer, UpdateAdmin } from '../generated/templates/ClankerToken/ClankerToken'
import { ADDRESS_ZERO } from './utils/constants'
import { loadDAOFromTreasury } from './utils/loadDAOFromTreasury'

/**
 * Get or create a ClankerTokenHolder entity
 */
function getOrCreateHolder(
  tokenAddress: Address,
  holderAddress: Bytes,
  timestamp: BigInt,
  blockNumber: BigInt
): ClankerTokenHolder {
  let id = tokenAddress.toHexString() + '-' + holderAddress.toHexString()
  let holder = ClankerTokenHolder.load(id)

  if (!holder) {
    holder = new ClankerTokenHolder(id)
    holder.token = tokenAddress.toHexString()
    holder.holder = holderAddress
    holder.balance = BigInt.fromI32(0)
    holder.updatedAt = timestamp
    holder.updatedAtBlock = blockNumber
  }

  return holder
}

/**
 * Handle Transfer events to track token holder balances
 */
export function handleTransfer(event: Transfer): void {
  let tokenAddress = event.address
  let from = event.params.from
  let to = event.params.to
  let value = event.params.value
  let timestamp = event.block.timestamp
  let blockNumber = event.block.number

  // Skip balance updates for self-transfers (from == to)
  // Only update timestamps in this case
  if (from.equals(to)) {
    // Still update timestamp for the holder
    if (from.notEqual(ADDRESS_ZERO)) {
      let holder = getOrCreateHolder(tokenAddress, from, timestamp, blockNumber)
      holder.updatedAt = timestamp
      holder.updatedAtBlock = blockNumber
      holder.save()
    }
    return
  }

  // Decrease sender balance (if not mint)
  if (from.notEqual(ADDRESS_ZERO)) {
    let fromHolder = getOrCreateHolder(tokenAddress, from, timestamp, blockNumber)
    // Defensively check balance to prevent negative values
    if (fromHolder.balance.lt(value)) {
      fromHolder.balance = BigInt.fromI32(0)
    } else {
      fromHolder.balance = fromHolder.balance.minus(value)
    }
    fromHolder.updatedAt = timestamp
    fromHolder.updatedAtBlock = blockNumber

    // Note: In subgraphs, we typically keep zero-balance holders for historical data
    fromHolder.save()
  }

  // Increase recipient balance (if not burn)
  if (to.notEqual(ADDRESS_ZERO)) {
    let toHolder = getOrCreateHolder(tokenAddress, to, timestamp, blockNumber)
    toHolder.balance = toHolder.balance.plus(value)
    toHolder.updatedAt = timestamp
    toHolder.updatedAtBlock = blockNumber
    toHolder.save()
  }
}

/**
 * Handle UpdateAdmin events to track admin changes and DAO linking
 */
export function handleUpdateAdmin(event: UpdateAdmin): void {
  let tokenAddress = event.address.toHexString()
  let oldAdmin = event.params.oldAdmin
  let newAdmin = event.params.newAdmin

  // Load the ClankerToken entity
  let token = ClankerToken.load(tokenAddress)
  if (!token) {
    log.warning('ClankerToken {} not found for UpdateAdmin event', [tokenAddress])
    return
  }

  // Get the previous DAO (before admin change)
  let previousDao = token.dao ? token.dao : null

  // Update the admin address
  token.tokenAdmin = newAdmin

  // Check if new admin matches a DAO treasury
  let newDao = loadDAOFromTreasury(newAdmin)

  if (newDao) {
    // Create ClankerTokenUnlinkedEvent if there was a previous DAO (different from new DAO)
    if (previousDao && previousDao != newDao.id) {
      let unlinkFeedEventId =
        event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-unlink'
      let unlinkFeedEvent = new ClankerTokenUnlinkedEvent(unlinkFeedEventId)
      unlinkFeedEvent.type = 'CLANKER_TOKEN_UNLINKED'
      unlinkFeedEvent.dao = previousDao
      unlinkFeedEvent.timestamp = event.block.timestamp
      unlinkFeedEvent.blockNumber = event.block.number
      unlinkFeedEvent.transactionHash = event.transaction.hash
      unlinkFeedEvent.actor = event.transaction.from
      unlinkFeedEvent.clankerToken = token.id
      unlinkFeedEvent.newAdmin = newAdmin
      unlinkFeedEvent.save()
    }

    // Link to DAO if new admin is a DAO treasury
    token.dao = newDao.id

    // Create ClankerTokenLinkedEvent
    let linkFeedEventId =
      event.transaction.hash.toHex() + '-' + event.logIndex.toString() + '-link'
    let linkFeedEvent = new ClankerTokenLinkedEvent(linkFeedEventId)
    linkFeedEvent.type = 'CLANKER_TOKEN_LINKED'
    linkFeedEvent.dao = newDao.id
    linkFeedEvent.timestamp = event.block.timestamp
    linkFeedEvent.blockNumber = event.block.number
    linkFeedEvent.transactionHash = event.transaction.hash
    linkFeedEvent.actor = event.transaction.from
    linkFeedEvent.clankerToken = token.id
    linkFeedEvent.previousAdmin = oldAdmin
    linkFeedEvent.save()

    log.info('ClankerToken {} admin changed to DAO treasury {}, linked to DAO {}', [
      tokenAddress,
      newAdmin.toHexString(),
      newDao.id,
    ])
  } else {
    // Unlink from DAO if new admin is not a DAO treasury
    token.dao = null

    // Create ClankerTokenUnlinkedEvent if there was a previous DAO
    if (previousDao) {
      let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
      let feedEvent = new ClankerTokenUnlinkedEvent(feedEventId)
      feedEvent.type = 'CLANKER_TOKEN_UNLINKED'
      feedEvent.dao = previousDao
      feedEvent.timestamp = event.block.timestamp
      feedEvent.blockNumber = event.block.number
      feedEvent.transactionHash = event.transaction.hash
      feedEvent.actor = event.transaction.from
      feedEvent.clankerToken = token.id
      feedEvent.newAdmin = newAdmin
      feedEvent.save()
    }

    log.info('ClankerToken {} admin changed to non-DAO address {}, unlinked from DAO', [
      tokenAddress,
      newAdmin.toHexString(),
    ])
  }

  // Mark as untrusted since admin was transferred
  token.isTrusted = false

  // Record when admin was changed
  token.adminChangedAt = event.block.timestamp

  token.save()
}
