import {
  ZoraDrop,
  ZoraDropCreatedEvent as ZoraDropCreatedFeedEvent,
} from '../generated/schema'
import { ZoraDrop as ZoraDropTemplate } from '../generated/templates'
import { EditionMetadataRenderer as EditionMetadataRendererContract } from '../generated/ZoraNFTCreator/EditionMetadataRenderer'
import { ERC721Drop as ERC721DropContract } from '../generated/ZoraNFTCreator/ERC721Drop'
import { CreatedDrop } from '../generated/ZoraNFTCreator/ZoraNFTCreatorV1'
import { loadDAOFromTreasury } from './utils/loadDAOFromTreasury'

export function handleCreatedDrop(event: CreatedDrop): void {
  // Use the creator address as the treasury address for DAO validation
  let dao = loadDAOFromTreasury(event.params.creator)

  // Only save the Zora drop if we found a valid DAO
  if (dao == null) {
    return
  }

  // Bind to ERC721Drop contract to get configuration
  let dropContract = ERC721DropContract.bind(event.params.editionContractAddress)

  // Read config() - exit if reverted
  let configResult = dropContract.try_config()
  if (configResult.reverted) {
    return
  }
  let config = configResult.value

  // Read salesConfig() - exit if reverted
  let salesConfigResult = dropContract.try_salesConfig()
  if (salesConfigResult.reverted) {
    return
  }
  let salesConfig = salesConfigResult.value

  // Read name() - exit if reverted
  let nameResult = dropContract.try_name()
  if (nameResult.reverted) {
    return
  }

  // Read symbol() - exit if reverted
  let symbolResult = dropContract.try_symbol()
  if (symbolResult.reverted) {
    return
  }

  // Bind to EditionMetadataRenderer to get metadata
  let rendererContract = EditionMetadataRendererContract.bind(
    config.getMetadataRenderer()
  )

  // Call tokenInfos(dropAddress) - exit if reverted
  let tokenInfosResult = rendererContract.try_tokenInfos(
    event.params.editionContractAddress
  )
  if (tokenInfosResult.reverted) {
    return
  }
  let tokenInfos = tokenInfosResult.value

  // Create the ZoraDrop entity
  let drop = new ZoraDrop(event.params.editionContractAddress.toHexString())

  // Link to DAO
  drop.dao = dao.id

  // Event params
  drop.creator = event.params.creator
  drop.editionSize = event.params.editionSize

  // Config from ERC721Drop.config()
  drop.metadataRenderer = config.getMetadataRenderer()
  drop.royaltyBPS = config.getRoyaltyBPS()
  drop.fundsRecipient = config.getFundsRecipient()

  // Sales configuration from ERC721Drop.salesConfig()
  drop.publicSalePrice = salesConfig.getPublicSalePrice()
  drop.maxSalePurchasePerAddress = salesConfig.getMaxSalePurchasePerAddress()
  drop.publicSaleStart = salesConfig.getPublicSaleStart()
  drop.publicSaleEnd = salesConfig.getPublicSaleEnd()
  drop.presaleStart = salesConfig.getPresaleStart()
  drop.presaleEnd = salesConfig.getPresaleEnd()
  drop.presaleMerkleRoot = salesConfig.getPresaleMerkleRoot()

  // NFT metadata from ERC721Drop
  drop.name = nameResult.value
  drop.symbol = symbolResult.value

  // Metadata from EditionMetadataRenderer.tokenInfos()
  drop.description = tokenInfos.getDescription()
  drop.imageURI = tokenInfos.getImageURI()
  drop.animationURI = tokenInfos.getAnimationURI()

  // Block metadata
  drop.createdAt = event.block.timestamp
  drop.createdAtBlock = event.block.number
  drop.transactionHash = event.transaction.hash

  drop.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  let feedEvent = new ZoraDropCreatedFeedEvent(feedEventId)
  feedEvent.type = 'ZORA_DROP_CREATED'
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.params.creator
  feedEvent.zoraDrop = drop.id
  feedEvent.save()

  // Instantiate the ZoraDrop template to start tracking ownership and purchases
  ZoraDropTemplate.create(event.params.editionContractAddress)
}
