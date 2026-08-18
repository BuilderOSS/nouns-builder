import {
  Address,
  BigInt,
  Bytes,
  DataSourceContext,
  ethereum,
} from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  createMockedFunction,
  dataSourceMock,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import { AuctionConfig, DAO, DAOTokenOwner, DAOVoter, Token } from '../generated/schema'
import {
  BatchMetadataUpdate,
  DescriptionUpdated,
} from '../generated/templates/MetadataRendererBase/MetadataRendererBase'
import { handleBatchMetadataUpdate, handleDescriptionUpdated } from '../src/metadata'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const METADATA_ADDRESS = '0x00000000000000000000000000000000000000ab'
const OWNER_ADDRESS = '0x00000000000000000000000000000000000000ac'

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
  dao.candidateCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfigId
  dao.save()
}

function seedToken(): void {
  const ownerId = TOKEN_ADDRESS + ':' + OWNER_ADDRESS

  const owner = new DAOTokenOwner(ownerId)
  owner.dao = TOKEN_ADDRESS
  owner.owner = Address.fromString(OWNER_ADDRESS)
  owner.delegate = Address.fromString(OWNER_ADDRESS)
  owner.daoTokenCount = 1
  owner.save()

  const voter = new DAOVoter(ownerId)
  voter.dao = TOKEN_ADDRESS
  voter.voter = Address.fromString(OWNER_ADDRESS)
  voter.daoTokenCount = 1
  voter.save()

  const token = new Token(TOKEN_ADDRESS + ':1')
  token.name = 'Old token'
  token.image = null
  token.content = null
  token.tokenContract = Address.fromString(TOKEN_ADDRESS)
  token.tokenId = BigInt.fromI32(1)
  token.owner = Address.fromString(OWNER_ADDRESS)
  token.ownerInfo = ownerId
  token.voterInfo = ownerId
  token.mintedAt = BigInt.fromI32(1)
  token.mintTransactionHash = Bytes.fromHexString(
    '0x1111111111111111111111111111111111111111111111111111111111111111'
  )
  token.dao = TOKEN_ADDRESS
  token.save()
}

function mockTokenURI(tokenId: i32, uri: string): void {
  createMockedFunction(
    Address.fromString(TOKEN_ADDRESS),
    'tokenURI',
    'tokenURI(uint256):(string)'
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId))])
    .returns([ethereum.Value.fromString(uri)])
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

function createBatchMetadataUpdateEvent(
  fromTokenId: i32,
  toTokenId: i32
): BatchMetadataUpdate {
  const event = newTypedMockEvent<BatchMetadataUpdate>()
  event.address = Address.fromString(METADATA_ADDRESS)
  event.parameters = [
    new ethereum.EventParam(
      '_fromTokenId',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(fromTokenId))
    ),
    new ethereum.EventParam(
      '_toTokenId',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(toTokenId))
    ),
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

  test('updates token metadata for the full batch range', () => {
    initializeTestWithDao()
    seedToken()
    mockTokenURI(1, 'data:application/json;base64,eyJuYW1lIjoiVXBkYXRlZCB0b2tlbiJ9')

    handleBatchMetadataUpdate(createBatchMetadataUpdateEvent(1, 1))

    assert.fieldEquals('Token', TOKEN_ADDRESS + ':1', 'name', 'Updated token')
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

  test('parses frontmatter links with single-space indentation', () => {
    initializeTestWithDao()

    const metadata =
      '---\nlinks:\n github: https://github.com\n x: https://twitter.com\n---\n\nhello world'

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

  test('parses escaped frontmatter links with single-space indentation', () => {
    initializeTestWithDao()

    const metadata =
      '---\\nlinks:\\n github: https://github.com\\n x: https://twitter.com\\n---\\n\\nhello world'

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
