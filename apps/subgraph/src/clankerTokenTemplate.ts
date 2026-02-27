import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { ClankerTokenHolder } from '../generated/schema'
import { Transfer } from '../generated/templates/ClankerToken/ERC20'
import { ADDRESS_ZERO } from './utils/constants'

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
