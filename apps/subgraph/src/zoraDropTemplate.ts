import { Address, BigInt } from '@graphprotocol/graph-ts'

import { ZoraDropOwner } from '../generated/schema'
import { Sale, Transfer } from '../generated/templates/ZoraDrop/ERC721Drop'

function getOrCreateZoraDropOwner(
  dropAddress: Address,
  ownerAddress: Address,
  timestamp: BigInt,
  blockNumber: BigInt
): ZoraDropOwner {
  let id = dropAddress.toHexString() + '-' + ownerAddress.toHexString()
  let owner = ZoraDropOwner.load(id)

  if (owner == null) {
    owner = new ZoraDropOwner(id)
    owner.drop = dropAddress.toHexString()
    owner.owner = ownerAddress
    owner.balance = BigInt.fromI32(0)
    owner.totalSpent = BigInt.fromI32(0)
    owner.totalPurchased = BigInt.fromI32(0)
    owner.updatedAt = timestamp
    owner.updatedAtBlock = blockNumber
  }

  return owner
}

export function handleSale(event: Sale): void {
  let dropAddress = event.address
  let buyerAddress = event.params.to

  let owner = getOrCreateZoraDropOwner(
    dropAddress,
    buyerAddress,
    event.block.timestamp,
    event.block.number
  )

  // Update purchase tracking
  owner.totalPurchased = owner.totalPurchased.plus(event.params.quantity)

  // Calculate total price: quantity * pricePerToken
  let totalPrice = event.params.quantity.times(event.params.pricePerToken)
  owner.totalSpent = owner.totalSpent.plus(totalPrice)

  // Note: Balance is updated by Transfer events, not here (to avoid double-counting)

  // Update timestamp
  owner.updatedAt = event.block.timestamp
  owner.updatedAtBlock = event.block.number

  owner.save()
}

export function handleTransfer(event: Transfer): void {
  let dropAddress = event.address
  let fromAddress = event.params.from
  let toAddress = event.params.to

  // This handler manages all balance updates for mints (from zero address),
  // transfers between users, and burns (to zero address)

  // Update sender (if not zero address/mint)
  if (event.params.from.toHexString() != '0x0000000000000000000000000000000000000000') {
    let fromOwner = getOrCreateZoraDropOwner(
      dropAddress,
      fromAddress,
      event.block.timestamp,
      event.block.number
    )

    fromOwner.balance = fromOwner.balance.minus(BigInt.fromI32(1))
    fromOwner.updatedAt = event.block.timestamp
    fromOwner.updatedAtBlock = event.block.number

    fromOwner.save()
  }

  // Update recipient (if not zero address/burn)
  if (event.params.to.toHexString() != '0x0000000000000000000000000000000000000000') {
    let toOwner = getOrCreateZoraDropOwner(
      dropAddress,
      toAddress,
      event.block.timestamp,
      event.block.number
    )

    toOwner.balance = toOwner.balance.plus(BigInt.fromI32(1))
    toOwner.updatedAt = event.block.timestamp
    toOwner.updatedAtBlock = event.block.number

    toOwner.save()
  }
}
