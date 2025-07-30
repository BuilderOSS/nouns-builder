import { BigInt, DataSourceContext } from '@graphprotocol/graph-ts'

import {
  DAODeployed as DAODeployedEvent,
  MetadataRendererUpdated as MetadataRendererUpdatedEvent,
} from '../generated/Manager/Manager'
import { AuctionConfig, DAO, Token } from '../generated/schema'
import {
  Auction as AuctionTemplate,
  Governor as GovernorTemplate,
  Token as TokenTemplate,
} from '../generated/templates'
import { Auction as AuctionContract } from '../generated/templates/Auction/Auction'
import { MetadataRendererBase as MetadataRendererBaseContract } from '../generated/templates/MetadataRendererBase/MetadataRendererBase'
import { Token as TokenContract } from '../generated/templates/Token/Token'
import { createMetadataRendererTemplate } from './utils/createMetadataRendererTemplate'
import { setTokenMetadata } from './utils/setTokenMetadata'

export function handleDAODeployed(event: DAODeployedEvent): void {
  let tokenContract = TokenContract.bind(event.params.token)
  let metadataContract = MetadataRendererBaseContract.bind(event.params.metadata)
  let auctionContract = AuctionContract.bind(event.params.auction)

  let auctionConfig = new AuctionConfig(event.params.token.toHexString())

  auctionConfig.duration = auctionContract.duration()
  auctionConfig.reservePrice = auctionContract.reservePrice()
  auctionConfig.timeBuffer = auctionContract.timeBuffer()
  auctionConfig.minimumBidIncrement = auctionContract.minBidIncrement()

  auctionConfig.save()

  let dao = new DAO(event.params.token.toHexString())

  dao.tokenAddress = event.params.token
  dao.metadataAddress = event.params.metadata
  dao.auctionAddress = event.params.auction
  dao.treasuryAddress = event.params.treasury
  dao.governorAddress = event.params.governor
  dao.name = tokenContract.name()
  dao.symbol = tokenContract.symbol()
  dao.description = metadataContract.description()
  dao.totalSupply = 0
  dao.contractImage = metadataContract.contractImage()
  dao.projectURI = metadataContract.projectURI()
  dao.proposalCount = 0
  dao.ownerCount = 0
  dao.voterCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfig.id

  dao.save()

  let tokenCtx = new DataSourceContext()
  tokenCtx.setString('metadataAddress', event.params.metadata.toHexString())
  TokenTemplate.createWithContext(event.params.token, tokenCtx)

  let govCtx = new DataSourceContext()
  govCtx.setString('tokenAddress', event.params.token.toHexString())
  govCtx.setString('treasuryAddress', event.params.treasury.toHexString())
  GovernorTemplate.createWithContext(event.params.governor, govCtx)

  let ctx = new DataSourceContext()
  ctx.setString('tokenAddress', event.params.token.toHexString())

  createMetadataRendererTemplate(metadataContract, event.params.metadata, ctx)
  AuctionTemplate.createWithContext(event.params.auction, ctx)
}

export function handleMetadataRendererUpdated(event: MetadataRendererUpdatedEvent): void {
  let metadataContract = MetadataRendererBaseContract.bind(event.params.renderer)

  // If token function reverts this contract does not implement the BaseMetadata interface and cannot be indexed
  let tokenAddress = metadataContract.try_token()
  if (tokenAddress.reverted) return

  let dao = DAO.load(tokenAddress.value.toHexString())

  if (!dao) return

  let tokenContract = TokenContract.bind(tokenAddress.value)

  // Update DAO metadata
  dao.description = metadataContract.description()
  dao.contractImage = metadataContract.contractImage()
  dao.projectURI = metadataContract.projectURI()

  dao.save()

  // Update token metadata
  let totalSupply = tokenContract.totalSupply()
  for (let i = BigInt.fromI32(0); i < totalSupply; i.plus(BigInt.fromI32(1))) {
    let tokenId = `${event.address.toHexString()}:${i.toString()}`
    let token = Token.load(tokenId)
    if (!token) continue

    let tokenURI = tokenContract.try_tokenURI(i)
    if (!tokenURI.reverted) {
      setTokenMetadata(token, tokenURI.value)
    } else {
      token.name = `${tokenContract.name()} #${i.toString()}`
      token.image = null
      token.content = null
    }
    token.save()
  }

  // Create new metadata renderer template
  let ctx = new DataSourceContext()
  ctx.setString('tokenAddress', tokenAddress.value.toHexString())
  createMetadataRendererTemplate(metadataContract, event.params.renderer, ctx)
}
