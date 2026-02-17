import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts'

import {
  ClankerToken,
  ZoraCoin,
  ZoraCoinCreatedEvent as ZoraCoinCreatedFeedEvent,
} from '../generated/schema'
import { CoinCreatedV4 } from '../generated/ZoraFactory/ZoraFactory'

// Platform referrer constants
const PLATFORM_REFERRER_BASE_MAINNET = '0xcf325a4c78912216249b818521b0798a0f904c10'
const PLATFORM_REFERRER_BASE_SEPOLIA = '0xc89e4075d630351355b8c0fee452b414b77582df'

export function handleCoinCreatedV4(event: CoinCreatedV4): void {
  // Filter by platformReferrer based on network
  let network = dataSource.network()
  let validReferrer: Address

  if (network == 'base') {
    // base-mainnet
    validReferrer = Address.fromString(PLATFORM_REFERRER_BASE_MAINNET)
  } else if (network == 'base-sepolia') {
    // base-sepolia
    validReferrer = Address.fromString(PLATFORM_REFERRER_BASE_SEPOLIA)
  } else {
    // Unknown network - ignore
    return
  }

  // Only process events with the correct platformReferrer
  if (event.params.platformReferrer.toHexString() != validReferrer.toHexString()) {
    return
  }

  // Create the ZoraCoin entity using coin address as ID
  let coin = new ZoraCoin(event.params.coin.toHexString())

  // Try to load ClankerToken by the currency (paired currency)
  let clankerToken = ClankerToken.load(event.params.currency.toHexString())

  // Link to ClankerToken and DAO if found
  if (clankerToken != null) {
    coin.clankerToken = clankerToken.id
    coin.dao = clankerToken.dao
  }

  // Event params - indexed
  coin.caller = event.params.caller
  coin.payoutRecipient = event.params.payoutRecipient
  coin.platformReferrer = event.params.platformReferrer

  // Event params - non-indexed
  coin.currency = event.params.currency
  coin.uri = event.params.uri
  coin.name = event.params.name
  coin.symbol = event.params.symbol
  coin.coinAddress = event.params.coin

  // Pool configuration (PoolKey struct)
  coin.poolCurrency0 = event.params.poolKey.currency0
  coin.poolCurrency1 = event.params.poolKey.currency1
  coin.poolFee = BigInt.fromI32(event.params.poolKey.fee)
  coin.poolTickSpacing = event.params.poolKey.tickSpacing
  coin.poolHooks = event.params.poolKey.hooks

  // Pool key hash
  coin.poolKeyHash = event.params.poolKeyHash

  // Version
  coin.version = event.params.version

  // Block metadata
  coin.createdAt = event.block.timestamp
  coin.createdAtBlock = event.block.number
  coin.transactionHash = event.transaction.hash

  coin.save()

  // Create feed event only if linked to a DAO
  if (clankerToken != null && coin.dao != null) {
    let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
    let feedEvent = new ZoraCoinCreatedFeedEvent(feedEventId)
    feedEvent.type = 'ZORA_COIN_CREATED'
    feedEvent.dao = coin.dao!
    feedEvent.timestamp = event.block.timestamp
    feedEvent.blockNumber = event.block.number
    feedEvent.transactionHash = event.transaction.hash
    feedEvent.actor = event.params.caller
    feedEvent.zoraCoin = coin.id
    feedEvent.save()
  }
}
