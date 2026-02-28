import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { ZoraCoinHolder } from '../generated/schema'
import { Transfer } from '../generated/templates/ZoraCoin/ERC20'
import { ADDRESS_ZERO } from './utils/constants'

/**
 * Get or create a ZoraCoinHolder entity
 */
function getOrCreateHolder(
  coinAddress: Address,
  holderAddress: Bytes,
  timestamp: BigInt,
  blockNumber: BigInt
): ZoraCoinHolder {
  let id = coinAddress.toHexString() + '-' + holderAddress.toHexString()
  let holder = ZoraCoinHolder.load(id)

  if (!holder) {
    holder = new ZoraCoinHolder(id)
    holder.coin = coinAddress.toHexString()
    holder.holder = holderAddress
    holder.balance = BigInt.fromI32(0)
    holder.updatedAt = timestamp
    holder.updatedAtBlock = blockNumber
  }

  return holder
}

/**
 * Handle Transfer events to track coin holder balances
 */
export function handleTransfer(event: Transfer): void {
  let coinAddress = event.address
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
      let holder = getOrCreateHolder(coinAddress, from, timestamp, blockNumber)
      holder.updatedAt = timestamp
      holder.updatedAtBlock = blockNumber
      holder.save()
    }
    return
  }

  // Decrease sender balance (if not mint)
  if (from.notEqual(ADDRESS_ZERO)) {
    let fromHolder = getOrCreateHolder(coinAddress, from, timestamp, blockNumber)
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
    let toHolder = getOrCreateHolder(coinAddress, to, timestamp, blockNumber)
    toHolder.balance = toHolder.balance.plus(value)
    toHolder.updatedAt = timestamp
    toHolder.updatedAtBlock = blockNumber
    toHolder.save()
  }
}
