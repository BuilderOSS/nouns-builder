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
  dataSourceMock,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import { AuctionConfig, DAO } from '../generated/schema'
import { ProposalCreated } from '../generated/templates/Governor/Governor'
import { handleProposalCreated } from '../src/governor'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const PROPOSER = '0x00000000000000000000000000000000000000bb'
const REPRESENTED = '0x00000000000000000000000000000000000000cc'

function setupDataSourceContext(): void {
  const context = new DataSourceContext()
  context.setString('tokenAddress', TOKEN_ADDRESS)
  dataSourceMock.setAddressAndContext(TOKEN_ADDRESS, context)
}

function seedDao(): void {
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
  dao.description = 'test'
  dao.contractImage = 'ipfs://test'
  dao.projectURI = 'https://example.com'
  dao.tokenAddress = Address.fromString(TOKEN_ADDRESS)
  dao.metadataAddress = Address.fromString(TOKEN_ADDRESS)
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

function createProposalCreatedEvent(description: string): ProposalCreated {
  const event = newTypedMockEvent<ProposalCreated>()

  const proposalTuple = new ethereum.Tuple()
  proposalTuple.push(ethereum.Value.fromAddress(Address.fromString(PROPOSER)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(20)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  proposalTuple.push(ethereum.Value.fromBoolean(false))
  proposalTuple.push(ethereum.Value.fromBoolean(false))
  proposalTuple.push(ethereum.Value.fromBoolean(false))

  event.parameters = [
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        )
      )
    ),
    new ethereum.EventParam(
      'targets',
      ethereum.Value.fromAddressArray([Address.fromString(TOKEN_ADDRESS)])
    ),
    new ethereum.EventParam(
      'values',
      ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(0)])
    ),
    new ethereum.EventParam(
      'calldatas',
      ethereum.Value.fromBytesArray([Bytes.fromHexString('0x1234')])
    ),
    new ethereum.EventParam('description', ethereum.Value.fromString(description)),
    new ethereum.EventParam(
      'descriptionHash',
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
        )
      )
    ),
    new ethereum.EventParam('proposal', ethereum.Value.fromTuple(proposalTuple)),
  ]

  return event
}

describe('Governor ProposalCreated parsing', () => {
  test('parses new JSON metadata format', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()

    const description =
      '{"version":1,"title":"JSON title","description":"JSON body","representedAddress":"' +
      REPRESENTED +
      '","discussionUrl":"https://example.com/discussion"}'

    handleProposalCreated(createProposalCreatedEvent(description))

    const id = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    assert.fieldEquals('Proposal', id, 'title', 'JSON title')
    assert.fieldEquals('Proposal', id, 'description', 'JSON body')
    assert.fieldEquals('Proposal', id, 'representedAddress', REPRESENTED)
    assert.fieldEquals('Proposal', id, 'discussionUrl', 'https://example.com/discussion')
    assert.fieldEquals('Proposal', id, 'metadata', description)
  })

  test('falls back to legacy title&&description parsing', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()

    const description = 'Legacy title&&Legacy body'
    handleProposalCreated(createProposalCreatedEvent(description))

    const id = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    assert.fieldEquals('Proposal', id, 'title', 'Legacy title')
    assert.fieldEquals('Proposal', id, 'description', 'Legacy body')
    assert.fieldEquals('Proposal', id, 'metadata', description)
  })
})
