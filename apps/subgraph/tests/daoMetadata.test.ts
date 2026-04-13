import { Address, BigInt, DataSourceContext, ethereum } from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  dataSourceMock,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import { AuctionConfig, DAO } from '../generated/schema'
import { DescriptionUpdated } from '../generated/templates/MetadataRendererBase/MetadataRendererBase'
import { handleDescriptionUpdated } from '../src/metadata'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const METADATA_ADDRESS = '0x00000000000000000000000000000000000000ab'

function setupDataSourceContext(): void {
  const context = new DataSourceContext()
  context.setString('tokenAddress', TOKEN_ADDRESS)
  dataSourceMock.setAddressAndContext(METADATA_ADDRESS, context)
}

function seedDao(initialDescription: string): void {
  const auctionConfigId = 'auction-config-test'

  const auctionConfig = new AuctionConfig(auctionConfigId)
  auctionConfig.duration = BigInt.fromI32(1)
  auctionConfig.reservePrice = BigInt.fromI32(1)
  auctionConfig.timeBuffer = BigInt.fromI32(1)
  auctionConfig.minimumBidIncrement = BigInt.fromI32(1)
  auctionConfig.save()

  const dao = new DAO(TOKEN_ADDRESS)
  dao.name = 'Test DAO'
  dao.symbol = 'TEST'
  dao.totalSupply = 0
  dao.description = initialDescription
  dao.contractImage = 'ipfs://test'
  dao.projectURI = 'https://example.com'
  dao.tokenAddress = Address.fromString(TOKEN_ADDRESS)
  dao.metadataAddress = Address.fromString(METADATA_ADDRESS)
  dao.auctionAddress = Address.fromString(TOKEN_ADDRESS)
  dao.treasuryAddress = Address.fromString(TOKEN_ADDRESS)
  dao.governorAddress = Address.fromString(TOKEN_ADDRESS)
  dao.ownerCount = 0
  dao.voterCount = 0
  dao.tokensCount = 0
  dao.proposalCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfigId
  dao.save()
}

function createDescriptionUpdatedEvent(newDescription: string): DescriptionUpdated {
  const event = newTypedMockEvent<DescriptionUpdated>()
  event.parameters = [
    new ethereum.EventParam(
      'prevDescription',
      ethereum.Value.fromString('old description')
    ),
    new ethereum.EventParam('newDescription', ethereum.Value.fromString(newDescription)),
  ]

  return event
}

describe('Metadata description parsing', () => {
  test('parses JSON metadata and stores sanitized links', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const metadata =
      '{"version":1,"description":"JSON dao description","links":{"x":"https://x.com/nouns","docs":"https://docs.example.com","invalid":"javascript:alert(1)","empty":""}}'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', 'JSON dao description')
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', metadata)
    assert.entityCount('DAOLink', 2)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'key', 'x')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://x.com/nouns')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-docs', 'key', 'docs')
    assert.fieldEquals(
      'DAOLink',
      TOKEN_ADDRESS + '-docs',
      'url',
      'https://docs.example.com'
    )
  })

  test('falls back to plain description when JSON parsing fails', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const description = 'Simple DAO description text'
    handleDescriptionUpdated(createDescriptionUpdatedEvent(description))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', description)
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', description)

    const dao = DAO.load(TOKEN_ADDRESS)
    assert.assertTrue(dao != null, 'DAO should exist after update')
    assert.entityCount('DAOLink', 0)
  })

  test('replaces previous links on metadata update', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const firstMetadata =
      '{"version":1,"description":"first","links":{"x":"https://x.com/nouns","docs":"https://docs.example.com"}}'
    const secondMetadata =
      '{"version":1,"description":"second","links":{"github":"https://github.com/nouns"}}'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(firstMetadata))
    handleDescriptionUpdated(createDescriptionUpdatedEvent(secondMetadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', 'second')
    assert.entityCount('DAOLink', 1)
    assert.fieldEquals(
      'DAOLink',
      TOKEN_ADDRESS + '-github',
      'url',
      'https://github.com/nouns'
    )
  })

  test('normalizes duplicate keys and keeps latest value', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const metadata =
      '{"version":1,"description":"with duplicate keys","links":{"X":"https://x.com/old","x":"https://x.com/new"}}'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.entityCount('DAOLink', 1)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'key', 'x')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://x.com/new')
  })

  test('ignores malformed and unsafe links', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const metadata =
      '{"version":1,"description":"link filtering","links":{"docs":"https://docs.example.com","badProtocol":"ftp://example.com","script":"javascript:alert(1)","empty":"","arr":["https://example.com"],"obj":{"url":"https://example.com"},"num":123}}'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.entityCount('DAOLink', 1)
    assert.fieldEquals(
      'DAOLink',
      TOKEN_ADDRESS + '-docs',
      'url',
      'https://docs.example.com'
    )
  })

  test('uses raw json as description when description key is missing', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const metadata = '{"version":1,"links":{"github":"https://github.com/nouns"}}'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', metadata)
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', metadata)
    assert.entityCount('DAOLink', 1)
    assert.fieldEquals(
      'DAOLink',
      TOKEN_ADDRESS + '-github',
      'url',
      'https://github.com/nouns'
    )
  })

  test('removes links when moving from json metadata to plain description', () => {
    clearStore()
    setupDataSourceContext()
    seedDao('legacy description')

    const firstMetadata =
      '{"version":1,"description":"first","links":{"x":"https://x.com/nouns","docs":"https://docs.example.com"}}'
    const plainDescription = 'now plain description only'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(firstMetadata))
    handleDescriptionUpdated(createDescriptionUpdatedEvent(plainDescription))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', plainDescription)
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', plainDescription)
    assert.entityCount('DAOLink', 0)
  })
})
