import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts'

import { DAO, MetadataItem, MetadataProperty, Token } from '../generated/schema'
import {
  BatchMetadataUpdate as BatchMetadataUpdateEvent,
  ContractImageUpdated as ContractImageUpdatedEvent,
  DescriptionUpdated as DescriptionUpdatedEvent,
  MetadataUpdate as MetadataUpdateEvent,
  WebsiteURIUpdated as URIUpdatedEvent,
} from '../generated/templates/MetadataRendererBase/MetadataRendererBase'
import {
  AddPropertiesCall as AddPropertiesFunctionCall,
  DeleteAndRecreatePropertiesCall as DeleteAndRecreatePropertiesFunctionCall,
  PropertyAdded as PropertyAddedEvent,
} from '../generated/templates/MetadataRendererV1/MetadataRendererV1'
import { Token as TokenContract } from '../generated/templates/Token/Token'
import { setTokenMetadata } from './utils/setTokenMetadata'

export function handleContractImageUpdated(event: ContractImageUpdatedEvent): void {
  let context = dataSource.context()
  let dao = DAO.load(context.getString('tokenAddress'))!
  dao.contractImage = event.params.newImage
  dao.save()
}

export function handleWebsiteURIUpdated(event: URIUpdatedEvent): void {
  let context = dataSource.context()
  let dao = DAO.load(context.getString('tokenAddress'))!
  dao.projectURI = event.params.newURI
  dao.save()
}

export function handleDescriptionUpdated(event: DescriptionUpdatedEvent): void {
  let context = dataSource.context()
  let dao = DAO.load(context.getString('tokenAddress'))!
  dao.description = event.params.newDescription
  dao.save()
}

export function handleMetadataUpdate(event: MetadataUpdateEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let tokenContract = TokenContract.bind(Address.fromString(tokenAddress))

  let tokenIdToUpdate = event.params._tokenId
  let token = Token.load(`${tokenAddress}:${tokenIdToUpdate.toString()}`)
  if (!token) return

  let tokenURI = tokenContract.try_tokenURI(tokenIdToUpdate)
  if (!tokenURI.reverted) {
    setTokenMetadata(token, tokenURI.value)
  } else {
    token.name = `${tokenContract.name()} #${tokenIdToUpdate.toString()}`
    token.image = null
    token.content = null
  }
  token.save()
}

export function handleBatchMetadataUpdate(event: BatchMetadataUpdateEvent): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')
  let tokenContract = TokenContract.bind(Address.fromString(tokenAddress))

  for (
    let i = event.params._toTokenId;
    i < event.params._toTokenId;
    i.plus(BigInt.fromI32(1))
  ) {
    let tokenId = `${tokenAddress}:${i.toString()}`
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
}

export function handleAddProperties(event: AddPropertiesFunctionCall): void {
  let context = dataSource.context()

  let inputs = event.inputs
  let dao = DAO.load(context.getString('tokenAddress'))!
  let id = dao.id + '-' + event.transaction.hash.toHexString()

  let property = new MetadataProperty(id)
  property.dao = dao.id
  property.names = inputs._names
  property.ipfsBaseUri = inputs._ipfsGroup.baseUri
  property.ipfsExtension = inputs._ipfsGroup.extension
  property.createdAt = event.block.timestamp
  property.deleted = false

  for (let i = 0; i < inputs._items.length; i++) {
    let input = inputs._items[i]
    let item = new MetadataItem(id + '-' + i.toString())
    item.index = i
    item.name = input.name
    item.propertyInfo = property.id
    item.propertyId = input.propertyId
    item.isNewProperty = input.isNewProperty
    item.save()
  }

  property.save()

  let properties: string[] =
    dao.metadataProperties === null ? [] : dao.metadataProperties!

  properties.push(property.id)
  dao.metadataProperties = properties
  dao.save()

  refetchAllTokenMetadata()
}

export function handleDeleteAndRecreateProperties(
  event: DeleteAndRecreatePropertiesFunctionCall,
): void {
  let context = dataSource.context()

  let inputs = event.inputs
  let dao = DAO.load(context.getString('tokenAddress'))!
  let id = dao.id + '-' + event.transaction.hash.toHexString()

  let property = new MetadataProperty(id)
  property.dao = dao.id
  property.names = inputs._names
  property.ipfsBaseUri = inputs._ipfsGroup.baseUri
  property.ipfsExtension = inputs._ipfsGroup.extension
  property.createdAt = event.block.timestamp
  property.deleted = false

  for (let i = 0; i < inputs._items.length; i++) {
    let input = inputs._items[i]
    let item = new MetadataItem(id + '-' + i.toString())
    item.index = i
    item.name = input.name
    item.propertyInfo = property.id
    item.propertyId = input.propertyId
    item.isNewProperty = input.isNewProperty
    item.save()
  }

  property.save()

  // Mark old properties as deleted
  if (dao.metadataProperties !== null) {
    let currentProperties = dao.metadataProperties!
    for (let i = 0; i < currentProperties.length; i++) {
      let property = MetadataProperty.load(currentProperties[i])!
      property.deleted = true
      property.save()
    }
  }

  let properties: string[] = []

  properties.push(property.id)
  dao.metadataProperties = properties
  dao.save()

  refetchAllTokenMetadata()
}

// TODO: This is a hack or workaround to refetch all token metadata after a property is added when callHandlers are disabled.
//       This should be removed if callHandlers work for zora-sepolia and zora-mainnet. Currently, the subgraph doesn't sync and it fails to deploy on Goldsky.
export function handlePropertyAdded(_event: PropertyAddedEvent): void {
  refetchAllTokenMetadata()
}

function refetchAllTokenMetadata(): void {
  let context = dataSource.context()

  let tokenAddress = context.getString('tokenAddress')

  let dao = DAO.load(tokenAddress)
  if (!dao) return

  let tokenContract = TokenContract.bind(Address.fromString(tokenAddress))

  let tokens = dao.tokens.load()

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    let tokenURI = tokenContract.try_tokenURI(token.tokenId)
    if (!tokenURI.reverted) {
      setTokenMetadata(token, tokenURI.value)
    }
    token.save()
  }
}
