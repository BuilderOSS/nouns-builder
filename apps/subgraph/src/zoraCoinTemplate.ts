import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { ZoraCoinHolder } from '../generated/schema'
import { Transfer } from '../generated/templates/ZoraCoin/ERC20'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

  // Decrease sender balance (if not mint)
  if (from.toHexString() != ZERO_ADDRESS) {
    let fromHolder = getOrCreateHolder(coinAddress, from, timestamp, blockNumber)
    fromHolder.balance = fromHolder.balance.minus(value)
    fromHolder.updatedAt = timestamp
    fromHolder.updatedAtBlock = blockNumber

    // Remove holder entity if balance is zero
    if (fromHolder.balance.equals(BigInt.fromI32(0))) {
      // Note: In subgraphs, we typically keep zero-balance holders for historical data
      // But we can delete if we want to save space
      fromHolder.save()
    } else {
      fromHolder.save()
    }
  }

  // Increase recipient balance (if not burn)
  if (to.toHexString() != ZERO_ADDRESS) {
    let toHolder = getOrCreateHolder(coinAddress, to, timestamp, blockNumber)
    toHolder.balance = toHolder.balance.plus(value)
    toHolder.updatedAt = timestamp
    toHolder.updatedAtBlock = blockNumber
    toHolder.save()
  }
}
