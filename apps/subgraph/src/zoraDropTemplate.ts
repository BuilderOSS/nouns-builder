import { Address, BigInt } from '@graphprotocol/graph-ts'

import { ZoraDrop, ZoraDropHolder } from '../generated/schema'
import { Sale, Transfer } from '../generated/templates/ZoraDrop/ERC721Drop'
import { ADDRESS_ZERO } from './utils/constants'

function getOrCreateZoraDropHolder(
  dropAddress: Address,
  holderAddress: Address,
  timestamp: BigInt,
  blockNumber: BigInt
): ZoraDropHolder {
  let id = dropAddress.toHexString() + '-' + holderAddress.toHexString()
  let holder = ZoraDropHolder.load(id)

  if (!holder) {
    holder = new ZoraDropHolder(id)
    holder.drop = dropAddress.toHexString()
    holder.holder = holderAddress
    holder.balance = BigInt.fromI32(0)
    holder.totalSpent = BigInt.fromI32(0)
    holder.totalPurchased = BigInt.fromI32(0)
    holder.updatedAt = timestamp
    holder.updatedAtBlock = blockNumber
  }

  return holder
}

export function handleSale(event: Sale): void {
  let dropAddress = event.address
  let buyerAddress = event.params.to

  let holder = getOrCreateZoraDropHolder(
    dropAddress,
    buyerAddress,
    event.block.timestamp,
    event.block.number
  )

  // Update purchase tracking
  holder.totalPurchased = holder.totalPurchased.plus(event.params.quantity)

  // Calculate total price: quantity * pricePerToken
  let totalPrice = event.params.quantity.times(event.params.pricePerToken)
  holder.totalSpent = holder.totalSpent.plus(totalPrice)

  // Note: Balance is updated by Transfer events, not here (to avoid double-counting)

  // Update timestamp
  holder.updatedAt = event.block.timestamp
  holder.updatedAtBlock = event.block.number

  holder.save()

  // Update ZoraDrop total sales amount
  let drop = ZoraDrop.load(dropAddress.toHexString())
  if (drop) {
    drop.totalSalesAmount = drop.totalSalesAmount.plus(totalPrice)
    drop.save()
  }
}

export function handleTransfer(event: Transfer): void {
  let dropAddress = event.address
  let fromAddress = event.params.from
  let toAddress = event.params.to

  // This handler manages all balance updates for mints (from zero address),
  // transfers between users, and burns (to zero address)

  // Update sender (if not zero address/mint)
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromHolder = getOrCreateZoraDropHolder(
      dropAddress,
      fromAddress,
      event.block.timestamp,
      event.block.number
    )

    fromHolder.balance = fromHolder.balance.minus(BigInt.fromI32(1))
    fromHolder.updatedAt = event.block.timestamp
    fromHolder.updatedAtBlock = event.block.number

    fromHolder.save()
  }

  // Update recipient (if not zero address/burn)
  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toHolder = getOrCreateZoraDropHolder(
      dropAddress,
      toAddress,
      event.block.timestamp,
      event.block.number
    )

    toHolder.balance = toHolder.balance.plus(BigInt.fromI32(1))
    toHolder.updatedAt = event.block.timestamp
    toHolder.updatedAtBlock = event.block.number

    toHolder.save()
  }
}
