import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

import { ClankerTokenHolder } from '../generated/schema'
import { Transfer } from '../generated/templates/ClankerToken/ERC20'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

  // Decrease sender balance (if not mint)
  if (from.toHexString() != ZERO_ADDRESS) {
    let fromHolder = getOrCreateHolder(tokenAddress, from, timestamp, blockNumber)
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
    let toHolder = getOrCreateHolder(tokenAddress, to, timestamp, blockNumber)
    toHolder.balance = toHolder.balance.plus(value)
    toHolder.updatedAt = timestamp
    toHolder.updatedAtBlock = blockNumber
    toHolder.save()
  }
}
