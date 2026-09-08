import { BigInt, Bytes, dataSource, log } from '@graphprotocol/graph-ts'

import { TokenCreated } from '../generated/Clanker/Clanker'
import {
  ClankerToken,
  ClankerTokenCreatedEvent as ClankerTokenCreatedFeedEvent,
} from '../generated/schema'
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
  if (!dao) {
    return
  }

  let token = new ClankerToken(event.params.tokenAddress.toHexString())
  token.dao = dao.id
  token.isTrusted = true
  token.adminChangedAt = null
  token.tokenAddress = event.params.tokenAddress
  token.msgSender = event.params.msgSender
  token.tokenAdmin = event.params.tokenAdmin
  token.tokenImage = event.params.tokenImage
  token.tokenName = event.params.tokenName
  token.tokenSymbol = event.params.tokenSymbol
  token.tokenMetadata = event.params.tokenMetadata
  token.tokenContext = event.params.tokenContext
  token.startingTick = BigInt.fromI32(event.params.startingTick)
  token.poolHook = event.params.poolHook
  token.poolId = event.params.poolId
  token.pairedToken = event.params.pairedToken
  token.locker = event.params.locker
  token.mevModule = event.params.mevModule
  token.extensionsSupply = event.params.extensionsSupply

  let extensions = event.params.extensions
  let extensionsBytes = new Array<Bytes>(extensions.length)
  for (let i = 0; i < extensions.length; i++) {
    extensionsBytes[i] = extensions[i]
  }
  token.extensions = extensionsBytes
  token.createdAt = event.block.timestamp
  token.createdAtBlock = event.block.number
  token.transactionHash = event.transaction.hash
  token.save()

  let swapRoute = buildSwapRoute(event.params.tokenAddress, event.block.timestamp)
  if (swapRoute) {
    swapRoute.clankerToken = token.id
    swapRoute.save()
  } else {
    log.warning(
      'Failed to build swap route for ClankerToken {}, token saved without route',
      [event.params.tokenAddress.toHexString()]
    )
  }

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
