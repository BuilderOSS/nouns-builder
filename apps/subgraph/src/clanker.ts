import { BigInt, Bytes, dataSource } from '@graphprotocol/graph-ts'

import { TokenCreated } from '../generated/Clanker/Clanker'
import { Governor as GovernorContract } from '../generated/Clanker/Governor'
import { Treasury as TreasuryContract } from '../generated/Clanker/Treasury'
import {
  ClankerToken,
  ClankerTokenCreatedEvent as ClankerTokenCreatedFeedEvent,
  DAO,
} from '../generated/schema'

export function handleTokenCreated(event: TokenCreated): void {
  // Only process events on base and base-sepolia networks
  let network = dataSource.network()
  if (network != 'base' && network != 'base-sepolia') {
    return
  }

  // Bind to Treasury contract to get owner (governor)
  let treasuryContract = TreasuryContract.bind(event.params.tokenAdmin)
  let ownerResult = treasuryContract.try_owner()

  // If we can't get the owner, this isn't a valid DAO treasury - ignore the token
  if (ownerResult.reverted) {
    return
  }

  let governorAddress = ownerResult.value

  // Bind to Governor contract to verify token and treasury
  let governorContract = GovernorContract.bind(governorAddress)
  let tokenResult = governorContract.try_token()
  let treasuryResult = governorContract.try_treasury()

  // If we can't read from governor, ignore the token
  if (tokenResult.reverted || treasuryResult.reverted) {
    return
  }

  // Verify that the treasury from governor matches tokenAdmin
  if (treasuryResult.value.toHexString() != event.params.tokenAdmin.toHexString()) {
    return
  }

  // Try to load the DAO by the token address from governor
  let daoId = tokenResult.value.toHexString()
  let dao = DAO.load(daoId)

  // Only save the Clanker token if we found a valid DAO
  if (dao == null) {
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

  token.save()

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
