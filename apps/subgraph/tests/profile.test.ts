import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  createMockedFunction,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import { AuctionConfig, DAO, DAOTokenOwner, DAOVoter, Profile, Token } from '../generated/schema'
import {
  DelegateChanged,
  Transfer,
} from '../generated/templates/Token/Token'
import { handleDelegateChanged, handleTransfer } from '../src/token'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const OWNER_A = '0x00000000000000000000000000000000000000ab'
const OWNER_B = '0x00000000000000000000000000000000000000ac'
const TIMESTAMP = 1

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
  dao.totalSupply = 1
  dao.description = 'dao description'
  dao.contractImage = 'ipfs://test'
  dao.projectURI = 'https://example.com'
  dao.tokenAddress = Address.fromString(TOKEN_ADDRESS)
  dao.metadataAddress = Address.fromString(TOKEN_ADDRESS)
  dao.auctionAddress = Address.fromString(TOKEN_ADDRESS)
  dao.treasuryAddress = Address.fromString(TOKEN_ADDRESS)
  dao.governorAddress = Address.fromString(TOKEN_ADDRESS)
  dao.ownerCount = 1
  dao.voterCount = 1
  dao.tokensCount = 1
  dao.proposalCount = 0
  dao.candidateCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfigId
  dao.createdAt = BigInt.fromI32(TIMESTAMP)
  dao.createdAtBlock = BigInt.fromI32(1)
  dao.transactionHash = Bytes.fromHexString(
    '0x1111111111111111111111111111111111111111111111111111111111111111'
  )
  dao.save()
}

function seedProfile(address: string, tokenCount: i32, ownerDaoCount: i32, voterDaoCount: i32): void {
  const profile = new Profile(address)
  profile.address = Address.fromString(address)
  profile.createdAt = BigInt.fromI32(TIMESTAMP)
  profile.updatedAt = BigInt.fromI32(TIMESTAMP)
  profile.lastActiveAt = BigInt.fromI32(TIMESTAMP)
  profile.tokenCount = tokenCount
  profile.ownerDaoCount = ownerDaoCount
  profile.voterDaoCount = voterDaoCount
  profile.proposalVotesCount = 0
  profile.proposalsSubmittedCount = 0
  profile.bidsPlacedCount = 0
  profile.auctionWinsCount = 0
  profile.save()
}

function seedOwnerRows(ownerAddress: string, delegateAddress: string): void {
  const ownerId = TOKEN_ADDRESS + ':' + ownerAddress
  const voterId = TOKEN_ADDRESS + ':' + delegateAddress

  const owner = new DAOTokenOwner(ownerId)
  owner.dao = TOKEN_ADDRESS
  owner.owner = Address.fromString(ownerAddress)
  owner.delegate = Address.fromString(delegateAddress)
  owner.profile = ownerAddress
  owner.daoTokenCount = 1
  owner.save()

  const voter = new DAOVoter(voterId)
  voter.dao = TOKEN_ADDRESS
  voter.voter = Address.fromString(delegateAddress)
  voter.profile = delegateAddress
  voter.daoTokenCount = 1
  voter.save()

  const token = new Token(TOKEN_ADDRESS + ':1')
  token.name = 'Test token'
  token.image = null
  token.content = null
  token.tokenContract = Address.fromString(TOKEN_ADDRESS)
  token.tokenId = BigInt.fromI32(1)
  token.owner = Address.fromString(ownerAddress)
  token.profile = ownerAddress
  token.ownerInfo = ownerId
  token.voterInfo = voterId
  token.mintedAt = BigInt.fromI32(TIMESTAMP)
  token.mintTransactionHash = Bytes.fromHexString(
    '0x1111111111111111111111111111111111111111111111111111111111111111'
  )
  token.dao = TOKEN_ADDRESS
  token.save()
}

function mockDelegates(owner: string, delegate: string): void {
  createMockedFunction(
    Address.fromString(TOKEN_ADDRESS),
    'delegates',
    'delegates(address):(address)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(owner))])
    .returns([ethereum.Value.fromAddress(Address.fromString(delegate))])
}

function mockBalanceOf(owner: string, balance: i32): void {
  createMockedFunction(
    Address.fromString(TOKEN_ADDRESS),
    'balanceOf',
    'balanceOf(address):(uint256)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(owner))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(balance))])
}

function createTransferEvent(from: string, to: string): Transfer {
  const event = newTypedMockEvent<Transfer>()
  event.address = Address.fromString(TOKEN_ADDRESS)
  event.block.timestamp = BigInt.fromI32(TIMESTAMP)
  event.parameters = [
    new ethereum.EventParam('from', ethereum.Value.fromAddress(Address.fromString(from))),
    new ethereum.EventParam('to', ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))),
  ]
  return event
}

function createDelegateChangedEvent(from: string, to: string): DelegateChanged {
  const event = newTypedMockEvent<DelegateChanged>()
  event.address = Address.fromString(TOKEN_ADDRESS)
  event.block.timestamp = BigInt.fromI32(TIMESTAMP)
  event.parameters = [
    new ethereum.EventParam('delegator', ethereum.Value.fromAddress(Address.fromString(from))),
    new ethereum.EventParam('from', ethereum.Value.fromAddress(Address.fromString(from))),
    new ethereum.EventParam('to', ethereum.Value.fromAddress(Address.fromString(to))),
  ]
  return event
}

describe('Profile counts', () => {
  test('updates profile counts on token transfer', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 1)
    seedOwnerRows(OWNER_A, OWNER_A)
    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(OWNER_B, OWNER_B)

    handleTransfer(createTransferEvent(OWNER_A, OWNER_B))

    assert.entityCount('Profile', 2)
    assert.entityCount('DAOTokenOwner', 1)
    assert.entityCount('DAOVoter', 1)

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '1')

    assert.fieldEquals('DAOTokenOwner', TOKEN_ADDRESS + ':' + OWNER_B, 'profile', OWNER_B)
    assert.fieldEquals('DAOVoter', TOKEN_ADDRESS + ':' + OWNER_B, 'profile', OWNER_B)
    assert.fieldEquals('Token', TOKEN_ADDRESS + ':1', 'profile', OWNER_B)
  })

  test('updates profile counts on delegate change', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 1)
    seedProfile(OWNER_B, 0, 0, 0)
    seedOwnerRows(OWNER_A, OWNER_A)
    mockBalanceOf(OWNER_A, 1)

    handleDelegateChanged(createDelegateChangedEvent(OWNER_A, OWNER_B))

    assert.entityCount('Profile', 2)
    assert.entityCount('DAOTokenOwner', 1)
    assert.entityCount('DAOVoter', 1)

    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '0')

    assert.fieldEquals('DAOTokenOwner', TOKEN_ADDRESS + ':' + OWNER_A, 'profile', OWNER_A)
    assert.fieldEquals('DAOTokenOwner', TOKEN_ADDRESS + ':' + OWNER_A, 'delegate', OWNER_B)
    assert.fieldEquals('DAOVoter', TOKEN_ADDRESS + ':' + OWNER_B, 'profile', OWNER_B)
    assert.fieldEquals('Token', TOKEN_ADDRESS + ':1', 'profile', OWNER_A)
    assert.fieldEquals('Token', TOKEN_ADDRESS + ':1', 'voterInfo', TOKEN_ADDRESS + ':' + OWNER_B)
  })
})
