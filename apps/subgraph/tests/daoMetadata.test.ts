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
  event.address = Address.fromString(METADATA_ADDRESS)
  event.parameters = [
    new ethereum.EventParam(
      'prevDescription',
      ethereum.Value.fromString('old description')
    ),
    new ethereum.EventParam('newDescription', ethereum.Value.fromString(newDescription)),
  ]

  return event
}

function initializeTestWithDao(initialDescription: string = 'legacy description'): void {
  clearStore()
  setupDataSourceContext()
  seedDao(initialDescription)
}

describe('Metadata description parsing', () => {
  test('parses markdown frontmatter and stores sanitized links', () => {
    initializeTestWithDao()

    const metadata =
      '---\nlinks:\n  x: https://x.com/nouns\n  docs: https://docs.example.com\n  invalid: javascript:alert(1)\n  empty:\n---\n\nMarkdown dao description'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', 'Markdown dao description')
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

  test('falls back to plain description when no frontmatter exists', () => {
    initializeTestWithDao()

    const description = 'Simple DAO description text'
    handleDescriptionUpdated(createDescriptionUpdatedEvent(description))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', description)
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', description)

    const dao = DAO.load(TOKEN_ADDRESS)
    assert.assertTrue(dao != null, 'DAO should exist after update')
    assert.entityCount('DAOLink', 0)
  })

  test('keeps empty body when frontmatter has links only', () => {
    initializeTestWithDao()

    const metadata = '---\nlinks:\n  github: https://github.com/nouns\n---\n\n'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', '')
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', metadata)
    assert.entityCount('DAOLink', 1)
    assert.fieldEquals(
      'DAOLink',
      TOKEN_ADDRESS + '-github',
      'url',
      'https://github.com/nouns'
    )
  })

  test('replaces previous links on metadata update', () => {
    initializeTestWithDao()

    const firstMetadata =
      '---\nlinks:\n  x: https://x.com/nouns\n  docs: https://docs.example.com\n---\n\nfirst'
    const secondMetadata =
      '---\nlinks:\n  github: https://github.com/nouns\n---\n\nsecond'

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
    initializeTestWithDao()

    const metadata =
      '---\nlinks:\n  X: https://x.com/old\n  x: https://x.com/new\n---\n\nwith duplicate keys'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.entityCount('DAOLink', 1)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'key', 'x')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://x.com/new')
  })

  test('canonicalizes twitter key to x', () => {
    initializeTestWithDao()

    const metadata = '---\nlinks:\n  twitter: https://x.com/nouns\n---\n\nbody'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.entityCount('DAOLink', 1)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'key', 'x')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://x.com/nouns')
  })

  test('parses escaped frontmatter payloads from contract storage', () => {
    initializeTestWithDao()

    const metadata =
      '---\\nlinks:\\n  github: https://github.com\\n  x: https://twitter.com\\n---\\n\\nhello world'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', 'hello world')
    assert.entityCount('DAOLink', 2)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-github', 'url', 'https://github.com')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://twitter.com')
  })

  test('parses frontmatter with CRLF line endings', () => {
    initializeTestWithDao()

    const metadata =
      '---\r\nlinks:\r\n  github: https://github.com\r\n  x: https://twitter.com\r\n---\r\n\r\nhello world'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', 'hello world')
    assert.entityCount('DAOLink', 2)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-github', 'url', 'https://github.com')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://twitter.com')
  })

  test('parses escaped frontmatter with CRLF line endings', () => {
    initializeTestWithDao()

    const metadata =
      '---\\r\\nlinks:\\r\\n  github: https://github.com\\r\\n  x: https://twitter.com\\r\\n---\\r\\n\\r\\nhello world'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', 'hello world')
    assert.entityCount('DAOLink', 2)
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-github', 'url', 'https://github.com')
    assert.fieldEquals('DAOLink', TOKEN_ADDRESS + '-x', 'url', 'https://twitter.com')
  })

  test('ignores malformed and unsafe links', () => {
    initializeTestWithDao()

    const metadata =
      '---\nlinks:\n  docs: https://docs.example.com\n  badProtocol: ftp://example.com\n  script: javascript:alert(1)\n  empty:\n---\n\nlink filtering'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.entityCount('DAOLink', 1)
    assert.fieldEquals(
      'DAOLink',
      TOKEN_ADDRESS + '-docs',
      'url',
      'https://docs.example.com'
    )
  })

  test('uses raw text when frontmatter is malformed', () => {
    initializeTestWithDao()

    const metadata =
      '---\nlinks:\n  github: https://github.com/nouns\n\nmissing closing delimiter'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(metadata))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', metadata)
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', metadata)
    assert.entityCount('DAOLink', 0)
  })

  test('removes links when moving from frontmatter metadata to plain description', () => {
    initializeTestWithDao()

    const firstMetadata =
      '---\nlinks:\n  x: https://x.com/nouns\n  docs: https://docs.example.com\n---\n\nfirst'
    const plainDescription = 'now plain description only'

    handleDescriptionUpdated(createDescriptionUpdatedEvent(firstMetadata))
    handleDescriptionUpdated(createDescriptionUpdatedEvent(plainDescription))

    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'description', plainDescription)
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'metadata', plainDescription)
    assert.entityCount('DAOLink', 0)
  })
})
