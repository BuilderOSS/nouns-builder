import { BigInt, Bytes, dataSource, log } from '@graphprotocol/graph-ts'

import { TokenCreated } from '../generated/Clanker/Clanker'
import {
  ClankerToken,
  ClankerTokenCreatedEvent as ClankerTokenCreatedFeedEvent,
} from '../generated/schema'
import { ClankerToken as ClankerTokenTemplate } from '../generated/templates'
import { loadDAOFromTreasury } from './utils/loadDAOFromTreasury'
import { buildSwapRoute } from './utils/swapPath'

export function handleTokenCreated(event: TokenCreated): void {
  // Only process events on base and base-sepolia networks
  let network = dataSource.network()
  if (network != 'base' && network != 'base-sepolia') {
    return
  }

  // Use the shared helper to validate and load the DAO
  let dao = loadDAOFromTreasury(event.params.tokenAdmin)

  // Only save the Clanker token if we found a valid DAO
  if (!dao) {
    return
  }

  // Create the ClankerToken entity
  let token = new ClankerToken(event.params.tokenAddress.toHexString())

  // Link to DAO
  token.dao = dao.id

  // Basic info
  token.tokenAddress = event.params.tokenAddress
  token.msgSender = event.params.msgSender
  token.tokenAdmin = event.params.tokenAdmin

  // Token metadata
  token.tokenImage = event.params.tokenImage
  token.tokenName = event.params.tokenName
  token.tokenSymbol = event.params.tokenSymbol
  token.tokenMetadata = event.params.tokenMetadata
  token.tokenContext = event.params.tokenContext

  // Pool configuration
  token.startingTick = BigInt.fromI32(event.params.startingTick)
  token.poolHook = event.params.poolHook
  token.poolId = event.params.poolId
  token.pairedToken = event.params.pairedToken

  // Additional modules
  token.locker = event.params.locker
  token.mevModule = event.params.mevModule
  token.extensionsSupply = event.params.extensionsSupply

  // Convert Address[] to Bytes[]
  let extensions = event.params.extensions
  let extensionsBytes = new Array<Bytes>(extensions.length)
  for (let i = 0; i < extensions.length; i++) {
    extensionsBytes[i] = extensions[i]
  }
  token.extensions = extensionsBytes

  // Block metadata
  token.createdAt = event.block.timestamp
  token.createdAtBlock = event.block.number
  token.transactionHash = event.transaction.hash

  // Save token first to ensure it's persisted regardless of swap route success
  token.save()

  // Build swap route for this token
  let swapRoute = buildSwapRoute(event.params.tokenAddress, event.block.timestamp)

  // Link swap route to token if it was successfully created
  if (swapRoute) {
    swapRoute.clankerToken = token.id
    swapRoute.save()
  } else {
    log.warning(
      'Failed to build swap route for ClankerToken {}, token saved without route',
      [event.params.tokenAddress.toHexString()]
    )
  }

  // Instantiate template to start tracking token holders
  ClankerTokenTemplate.create(event.params.tokenAddress)

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new ClankerTokenCreatedFeedEvent(feedEventId)
  feedEvent.type = 'CLANKER_TOKEN_CREATED'
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.params.msgSender
  feedEvent.clankerToken = token.id
  feedEvent.save()
}
