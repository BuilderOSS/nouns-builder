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

import { AuctionConfig, DAO, ProposalSigner } from '../generated/schema'
import {
  ProposalCreated,
  ProposalSignersSet,
  ProposalUpdated,
} from '../generated/templates/Governor/Governor'
import {
  handleProposalCreated,
  handleProposalSignersSet,
  handleProposalUpdated,
} from '../src/governor'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const PROPOSER = '0x00000000000000000000000000000000000000bb'
const REPRESENTED = '0x00000000000000000000000000000000000000cc'
const GOVERNOR_ADDRESS = '0x00000000000000000000000000000000000000dd'
const NEW_PROPOSAL_ID =
  '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'

function setupDataSourceContext(): void {
  const context = new DataSourceContext()
  context.setString('tokenAddress', TOKEN_ADDRESS)
  context.setString('treasuryAddress', TOKEN_ADDRESS)
  dataSourceMock.setAddressAndContext(GOVERNOR_ADDRESS, context)
}

function mockGovernorProposalUpdatablePeriod(): void {
  createMockedFunction(
    Address.fromString(GOVERNOR_ADDRESS),
    'proposalUpdatablePeriod',
    'proposalUpdatablePeriod():(uint256)'
  ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))])
}

function mockGovernorTokenAddress(): void {
  createMockedFunction(
    Address.fromString(GOVERNOR_ADDRESS),
    'token',
    'token():(address)'
  ).returns([ethereum.Value.fromAddress(Address.fromString(TOKEN_ADDRESS))])
}

function mockTokenVotes(signer: string, votes: i32): void {
  createMockedFunction(
    Address.fromString(TOKEN_ADDRESS),
    'getVotes',
    'getVotes(address):(uint256)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(signer))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(votes))])
}

function mockGovernorGetProposal(proposalId: Bytes): void {
  const proposalTuple = new ethereum.Tuple()
  proposalTuple.push(ethereum.Value.fromAddress(Address.fromString(PROPOSER)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(200)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(20)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  proposalTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  proposalTuple.push(ethereum.Value.fromBoolean(false))
  proposalTuple.push(ethereum.Value.fromBoolean(false))
  proposalTuple.push(ethereum.Value.fromBoolean(false))

  createMockedFunction(
    Address.fromString(GOVERNOR_ADDRESS),
    'getProposal',
    'getProposal(bytes32):((address,uint32,uint32,uint32,uint32,uint32,uint32,uint32,uint32,bool,bool,bool))'
  )
    .withArgs([ethereum.Value.fromFixedBytes(proposalId)])
    .returns([ethereum.Value.fromTuple(proposalTuple)])
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
  dao.candidateCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfigId
  dao.createdAt = BigInt.fromI32(1)
  dao.createdAtBlock = BigInt.fromI32(1)
  dao.transactionHash = Bytes.fromHexString(
    '0x1111111111111111111111111111111111111111111111111111111111111111'
  )
  dao.save()
}

function createProposalCreatedEvent(description: string): ProposalCreated {
  const event = newTypedMockEvent<ProposalCreated>()
  event.address = Address.fromString(GOVERNOR_ADDRESS)

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

function createProposalUpdatedEvent(
  description: string,
  updateMessage: string
): ProposalUpdated {
  const event = newTypedMockEvent<ProposalUpdated>()
  event.address = Address.fromString(GOVERNOR_ADDRESS)

  event.parameters = [
    new ethereum.EventParam(
      'oldProposalId',
      ethereum.Value.fromBytes(
        Bytes.fromHexString(
          '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        )
      )
    ),
    new ethereum.EventParam(
      'newProposalId',
      ethereum.Value.fromBytes(Bytes.fromHexString(NEW_PROPOSAL_ID))
    ),
    new ethereum.EventParam(
      'proposer',
      ethereum.Value.fromAddress(Address.fromString(PROPOSER))
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
      ethereum.Value.fromBytesArray([Bytes.fromHexString('0xabcd')])
    ),
    new ethereum.EventParam('description', ethereum.Value.fromString(description)),
    new ethereum.EventParam('updateMessage', ethereum.Value.fromString(updateMessage)),
  ]

  return event
}

function createProposalSignersSetEvent(signers: string[]): ProposalSignersSet {
  const event = newTypedMockEvent<ProposalSignersSet>()
  event.address = Address.fromString(GOVERNOR_ADDRESS)

  let signerAddresses: Address[] = []
  for (let i = 0; i < signers.length; i++) {
    signerAddresses.push(Address.fromString(signers[i]))
  }

  event.parameters = [
    new ethereum.EventParam(
      'proposalId',
      ethereum.Value.fromBytes(Bytes.fromHexString(NEW_PROPOSAL_ID))
    ),
    new ethereum.EventParam('signers', ethereum.Value.fromAddressArray(signerAddresses)),
  ]

  return event
}

describe('Governor ProposalCreated parsing', () => {
  test('parses new JSON metadata format', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()
    mockGovernorProposalUpdatablePeriod()

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
    assert.fieldEquals('Proposal', id, 'updateCount', '0')
    assert.fieldEquals('Proposal', id, 'isSigned', 'false')
    assert.fieldEquals('Proposal', id, 'updatePeriodEnd', '200')
  })

  test('falls back to legacy title&&description parsing', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()
    mockGovernorProposalUpdatablePeriod()

    const description = 'Legacy title&&Legacy body'
    handleProposalCreated(createProposalCreatedEvent(description))

    const id = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    assert.fieldEquals('Proposal', id, 'title', 'Legacy title')
    assert.fieldEquals('Proposal', id, 'description', 'Legacy body')
    assert.fieldEquals('Proposal', id, 'metadata', description)
  })

  test('creates replacement proposal with same proposal number and snapshot block', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()
    mockGovernorProposalUpdatablePeriod()

    const originalDescription = 'Original&&Body'
    handleProposalCreated(createProposalCreatedEvent(originalDescription))

    mockGovernorGetProposal(Bytes.fromHexString(NEW_PROPOSAL_ID))
    const updatedDescription =
      '{"version":1,"title":"Updated title","description":"Updated body"}'
    handleProposalUpdated(
      createProposalUpdatedEvent(updatedDescription, 'Fixing transaction calldata')
    )

    const oldId = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    const newId = NEW_PROPOSAL_ID
    assert.fieldEquals('Proposal', oldId, 'replacedBy', newId)
    assert.fieldEquals('Proposal', newId, 'replaces', oldId)
    assert.fieldEquals('Proposal', newId, 'proposalNumber', '1')
    assert.fieldEquals('Proposal', newId, 'updateCount', '1')
    assert.fieldEquals('Proposal', newId, 'updateMessage', 'Fixing transaction calldata')
    assert.fieldEquals('Proposal', newId, 'snapshotBlockNumber', '1')
    assert.fieldEquals('Proposal', newId, 'timeCreated', '200')
    assert.fieldEquals('DAO', TOKEN_ADDRESS, 'proposalCount', '1')
  })

  test('indexes proposal signers and marks proposal as signed', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()
    mockGovernorProposalUpdatablePeriod()

    handleProposalCreated(createProposalCreatedEvent('Original&&Body'))
    mockGovernorGetProposal(Bytes.fromHexString(NEW_PROPOSAL_ID))
    handleProposalUpdated(
      createProposalUpdatedEvent('{"title":"Updated","description":"Body"}', 'update')
    )

    const signerOne = '0x0000000000000000000000000000000000000011'
    const signerTwo = '0x0000000000000000000000000000000000000022'
    mockGovernorTokenAddress()
    mockTokenVotes(signerOne, 42)
    mockTokenVotes(signerTwo, 55)

    handleProposalSignersSet(createProposalSignersSetEvent([signerOne, signerTwo]))

    const newId = NEW_PROPOSAL_ID
    assert.fieldEquals('Proposal', newId, 'isSigned', 'true')
    assert.fieldEquals('ProposalSigner', newId + '-' + signerOne, 'voteWeight', '42')
    assert.fieldEquals('ProposalSigner', newId + '-' + signerTwo, 'voteWeight', '55')
  })

  test('removes stale proposal signers when the signer set shrinks', () => {
    clearStore()
    setupDataSourceContext()
    seedDao()
    mockGovernorProposalUpdatablePeriod()

    handleProposalCreated(createProposalCreatedEvent('Original&&Body'))
    mockGovernorGetProposal(Bytes.fromHexString(NEW_PROPOSAL_ID))
    handleProposalUpdated(
      createProposalUpdatedEvent('{"title":"Updated","description":"Body"}', 'update')
    )

    const signerOne = '0x0000000000000000000000000000000000000011'
    const signerTwo = '0x0000000000000000000000000000000000000022'
    mockGovernorTokenAddress()
    mockTokenVotes(signerOne, 42)
    mockTokenVotes(signerTwo, 55)
    handleProposalSignersSet(createProposalSignersSetEvent([signerOne, signerTwo]))

    mockTokenVotes(signerTwo, 55)
    handleProposalSignersSet(createProposalSignersSetEvent([signerTwo]))

    const oldSignerId = NEW_PROPOSAL_ID + '-' + signerOne
    const newSignerId = NEW_PROPOSAL_ID + '-' + signerTwo
    assert.assertTrue(ProposalSigner.load(oldSignerId) == null)
    assert.fieldEquals('ProposalSigner', newSignerId, 'voteWeight', '55')
  })
})
