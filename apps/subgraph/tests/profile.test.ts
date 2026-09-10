import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  createMockedFunction,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import {
  AuctionConfig,
  DAO,
  DAOTokenOwner,
  DAOVoter,
  Profile,
  Token,
} from '../generated/schema'
import { DelegateChanged, Transfer } from '../generated/templates/Token/Token'
import { handleDelegateChanged, handleTransfer } from '../src/token'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const TOKEN_ADDRESS_2 = '0x00000000000000000000000000000000000000ad'
const OWNER_A = '0x00000000000000000000000000000000000000ab'
const OWNER_B = '0x00000000000000000000000000000000000000ac'
const OWNER_C = '0x00000000000000000000000000000000000000ae'
const TIMESTAMP = 1
const TIMESTAMP_2 = 100

function seedDao(
  tokenAddress: string = TOKEN_ADDRESS,
  ownerCount: i32 = 1,
  voterCount: i32 = 1,
  tokensCount: i32 = 1
): void {
  const auctionConfigId = 'auction-config-test-' + tokenAddress

  const auctionConfig = new AuctionConfig(auctionConfigId)
  auctionConfig.duration = BigInt.fromI32(1)
  auctionConfig.reservePrice = BigInt.fromI32(1)
  auctionConfig.timeBuffer = BigInt.fromI32(1)
  auctionConfig.minimumBidIncrement = BigInt.fromI32(1)
  auctionConfig.save()

  const dao = new DAO(tokenAddress)
  dao.name = 'Test DAO'
  dao.symbol = 'TEST'
  dao.totalSupply = tokensCount
  dao.description = 'dao description'
  dao.contractImage = 'ipfs://test'
  dao.projectURI = 'https://example.com'
  dao.tokenAddress = Address.fromString(tokenAddress)
  dao.metadataAddress = Address.fromString(tokenAddress)
  dao.auctionAddress = Address.fromString(tokenAddress)
  dao.treasuryAddress = Address.fromString(tokenAddress)
  dao.governorAddress = Address.fromString(tokenAddress)
  dao.ownerCount = ownerCount
  dao.voterCount = voterCount
  dao.tokensCount = tokensCount
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

function seedProfile(
  address: string,
  tokenCount: i32,
  ownerDaoCount: i32,
  voterDaoCount: i32
): void {
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

function seedOwnerRows(
  ownerAddress: string,
  delegateAddress: string,
  tokenAddress: string = TOKEN_ADDRESS,
  tokenId: i32 = 1
): void {
  const ownerId = tokenAddress + ':' + ownerAddress
  const voterId = tokenAddress + ':' + delegateAddress

  const owner = new DAOTokenOwner(ownerId)
  owner.dao = tokenAddress
  owner.owner = Address.fromString(ownerAddress)
  owner.delegate = Address.fromString(delegateAddress)
  owner.profile = ownerAddress
  owner.daoTokenCount = 1
  owner.lastActiveAt = BigInt.fromI32(TIMESTAMP)
  owner.save()

  const voter = new DAOVoter(voterId)
  voter.dao = tokenAddress
  voter.voter = Address.fromString(delegateAddress)
  voter.profile = delegateAddress
  voter.daoTokenCount = 1
  voter.lastActiveAt = BigInt.fromI32(TIMESTAMP)
  voter.save()

  const token = new Token(tokenAddress + ':' + tokenId.toString())
  token.name = 'Test token'
  token.image = null
  token.content = null
  token.tokenContract = Address.fromString(tokenAddress)
  token.tokenId = BigInt.fromI32(tokenId)
  token.owner = Address.fromString(ownerAddress)
  token.profile = ownerAddress
  token.ownerInfo = ownerId
  token.voterInfo = voterId
  token.mintedAt = BigInt.fromI32(TIMESTAMP)
  token.mintTransactionHash = Bytes.fromHexString(
    '0x1111111111111111111111111111111111111111111111111111111111111111'
  )
  token.dao = tokenAddress
  token.save()
}

function mockDelegates(
  owner: string,
  delegate: string,
  tokenAddress: string = TOKEN_ADDRESS
): void {
  createMockedFunction(
    Address.fromString(tokenAddress),
    'delegates',
    'delegates(address):(address)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(owner))])
    .returns([ethereum.Value.fromAddress(Address.fromString(delegate))])
}

function mockBalanceOf(
  owner: string,
  balance: i32,
  tokenAddress: string = TOKEN_ADDRESS
): void {
  createMockedFunction(
    Address.fromString(tokenAddress),
    'balanceOf',
    'balanceOf(address):(uint256)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(owner))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(balance))])
}

function mockTokenURI(
  tokenId: i32,
  uri: string,
  tokenAddress: string = TOKEN_ADDRESS
): void {
  createMockedFunction(
    Address.fromString(tokenAddress),
    'tokenURI',
    'tokenURI(uint256):(string)'
  )
    .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId))])
    .returns([ethereum.Value.fromString(uri)])
}

function mockTokenName(name: string, tokenAddress: string = TOKEN_ADDRESS): void {
  createMockedFunction(
    Address.fromString(tokenAddress),
    'name',
    'name():(string)'
  ).returns([ethereum.Value.fromString(name)])
}

function createTransferEvent(
  from: string,
  to: string,
  tokenId: i32 = 1,
  tokenAddress: string = TOKEN_ADDRESS,
  timestamp: i32 = TIMESTAMP
): Transfer {
  const event = newTypedMockEvent<Transfer>()
  event.address = Address.fromString(tokenAddress)
  event.block.timestamp = BigInt.fromI32(timestamp)
  event.parameters = [
    new ethereum.EventParam('from', ethereum.Value.fromAddress(Address.fromString(from))),
    new ethereum.EventParam('to', ethereum.Value.fromAddress(Address.fromString(to))),
    new ethereum.EventParam(
      'tokenId',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(tokenId))
    ),
  ]
  return event
}

function createDelegateChangedEvent(
  delegator: string,
  from: string,
  to: string,
  tokenAddress: string = TOKEN_ADDRESS,
  timestamp: i32 = TIMESTAMP
): DelegateChanged {
  const event = newTypedMockEvent<DelegateChanged>()
  event.address = Address.fromString(tokenAddress)
  event.block.timestamp = BigInt.fromI32(timestamp)
  event.parameters = [
    new ethereum.EventParam(
      'delegator',
      ethereum.Value.fromAddress(Address.fromString(delegator))
    ),
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

    handleDelegateChanged(createDelegateChangedEvent(OWNER_A, OWNER_A, OWNER_B))

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
    assert.fieldEquals(
      'DAOTokenOwner',
      TOKEN_ADDRESS + ':' + OWNER_A,
      'delegate',
      OWNER_B
    )
    assert.fieldEquals('DAOVoter', TOKEN_ADDRESS + ':' + OWNER_B, 'profile', OWNER_B)
    assert.fieldEquals('Token', TOKEN_ADDRESS + ':1', 'profile', OWNER_A)
    assert.fieldEquals(
      'Token',
      TOKEN_ADDRESS + ':1',
      'voterInfo',
      TOKEN_ADDRESS + ':' + OWNER_B
    )
  })

  test('handles multiple token transfers to same owner', () => {
    clearStore()
    seedDao(TOKEN_ADDRESS, 0, 0, 3)
    seedProfile(OWNER_A, 2, 1, 1)
    seedOwnerRows(OWNER_A, OWNER_A, TOKEN_ADDRESS, 1)
    seedOwnerRows(OWNER_A, OWNER_A, TOKEN_ADDRESS, 2)
    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(OWNER_B, OWNER_B)

    // Transfer first token from OWNER_A to OWNER_B
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 1))

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '1')

    // Transfer second token from OWNER_A to OWNER_B
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 2))

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '2')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '1')
  })

  test('tracks profiles across multiple DAOs', () => {
    clearStore()
    seedDao(TOKEN_ADDRESS, 1, 1, 1)
    seedDao(TOKEN_ADDRESS_2, 1, 1, 1)
    seedProfile(OWNER_A, 2, 2, 2)
    seedOwnerRows(OWNER_A, OWNER_A, TOKEN_ADDRESS, 1)
    seedOwnerRows(OWNER_A, OWNER_A, TOKEN_ADDRESS_2, 1)
    mockDelegates(OWNER_A, OWNER_A, TOKEN_ADDRESS)
    mockDelegates(OWNER_B, OWNER_B, TOKEN_ADDRESS)
    mockDelegates(OWNER_A, OWNER_A, TOKEN_ADDRESS_2)
    mockDelegates(OWNER_B, OWNER_B, TOKEN_ADDRESS_2)

    // Transfer from DAO 1
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 1, TOKEN_ADDRESS))

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '1')

    // Transfer from DAO 2
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 1, TOKEN_ADDRESS_2))

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '2')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '2')
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '2')
  })

  test('updates timestamps on profile activity', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 1)
    seedOwnerRows(OWNER_A, OWNER_A)
    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(OWNER_B, OWNER_B)

    // Initial timestamp should be TIMESTAMP (1)
    assert.fieldEquals('Profile', OWNER_A, 'lastActiveAt', TIMESTAMP.toString())

    // Transfer at a later timestamp
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 1, TOKEN_ADDRESS, TIMESTAMP_2))

    // OWNER_A lastActiveAt should be updated to TIMESTAMP_2
    assert.fieldEquals('Profile', OWNER_A, 'lastActiveAt', TIMESTAMP_2.toString())
    assert.fieldEquals('Profile', OWNER_A, 'updatedAt', TIMESTAMP_2.toString())

    // OWNER_B should be created with TIMESTAMP_2
    assert.fieldEquals('Profile', OWNER_B, 'createdAt', TIMESTAMP_2.toString())
    assert.fieldEquals('Profile', OWNER_B, 'lastActiveAt', TIMESTAMP_2.toString())
  })

  test('handles delegate changes with multiple tokens', () => {
    clearStore()
    seedDao(TOKEN_ADDRESS, 1, 1, 2)
    seedProfile(OWNER_A, 2, 1, 1)
    seedProfile(OWNER_B, 0, 0, 0)

    // Create owner with 2 tokens
    const ownerId = TOKEN_ADDRESS + ':' + OWNER_A
    const voterId = TOKEN_ADDRESS + ':' + OWNER_A
    const owner = new DAOTokenOwner(ownerId)
    owner.dao = TOKEN_ADDRESS
    owner.owner = Address.fromString(OWNER_A)
    owner.delegate = Address.fromString(OWNER_A)
    owner.profile = OWNER_A
    owner.daoTokenCount = 2
    owner.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    owner.save()

    const voter = new DAOVoter(voterId)
    voter.dao = TOKEN_ADDRESS
    voter.voter = Address.fromString(OWNER_A)
    voter.profile = OWNER_A
    voter.daoTokenCount = 2
    voter.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    voter.save()

    mockBalanceOf(OWNER_A, 2)

    handleDelegateChanged(createDelegateChangedEvent(OWNER_A, OWNER_A, OWNER_B))

    // OWNER_A should remain owner but OWNER_B becomes voter
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '2')
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '0')
  })

  test('correctly handles delegation to different address', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 0)
    seedProfile(OWNER_B, 0, 0, 1)
    seedProfile(OWNER_C, 0, 0, 0)

    // OWNER_A owns token, delegates to OWNER_B
    const ownerId = TOKEN_ADDRESS + ':' + OWNER_A
    const voterId = TOKEN_ADDRESS + ':' + OWNER_B
    const owner = new DAOTokenOwner(ownerId)
    owner.dao = TOKEN_ADDRESS
    owner.owner = Address.fromString(OWNER_A)
    owner.delegate = Address.fromString(OWNER_B)
    owner.profile = OWNER_A
    owner.daoTokenCount = 1
    owner.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    owner.save()

    const voter = new DAOVoter(voterId)
    voter.dao = TOKEN_ADDRESS
    voter.voter = Address.fromString(OWNER_B)
    voter.profile = OWNER_B
    voter.daoTokenCount = 1
    voter.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    voter.save()

    mockBalanceOf(OWNER_A, 1)

    // Change delegation from OWNER_B to OWNER_C
    handleDelegateChanged(createDelegateChangedEvent(OWNER_A, OWNER_B, OWNER_C))

    // OWNER_A remains owner
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')

    // OWNER_B loses voter status
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '0')

    // OWNER_C gains voter status
    assert.fieldEquals('Profile', OWNER_C, 'voterDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_C, 'ownerDaoCount', '0')
  })

  test('creates profile on first interaction', () => {
    clearStore()
    seedDao()
    mockDelegates(
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000'
    )
    mockDelegates(OWNER_A, OWNER_A)
    mockTokenName('Test DAO')
    mockTokenURI(1, 'ipfs://test')

    // No profiles exist yet
    assert.entityCount('Profile', 0)

    // Mint (transfer from zero address) creates profile
    handleTransfer(
      createTransferEvent('0x0000000000000000000000000000000000000000', OWNER_A)
    )

    assert.entityCount('Profile', 1)
    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'createdAt', TIMESTAMP.toString())
  })

  test('handles token burn correctly', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 1)
    seedOwnerRows(OWNER_A, OWNER_A)
    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000'
    )

    // Burn token (transfer to zero address)
    handleTransfer(
      createTransferEvent(OWNER_A, '0x0000000000000000000000000000000000000000')
    )

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')
  })

  test('decrements tokenCount when transferring token away', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 2, 1, 1)
    seedProfile(OWNER_B, 0, 0, 0)

    // Create owner with 2 tokens
    const ownerId = TOKEN_ADDRESS + ':' + OWNER_A
    const owner = new DAOTokenOwner(ownerId)
    owner.dao = TOKEN_ADDRESS
    owner.owner = Address.fromString(OWNER_A)
    owner.delegate = Address.fromString(OWNER_A)
    owner.profile = OWNER_A
    owner.daoTokenCount = 2
    owner.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    owner.save()

    const voterId = TOKEN_ADDRESS + ':' + OWNER_A
    const voter = new DAOVoter(voterId)
    voter.dao = TOKEN_ADDRESS
    voter.voter = Address.fromString(OWNER_A)
    voter.profile = OWNER_A
    voter.daoTokenCount = 2
    voter.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    voter.save()

    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(OWNER_B, OWNER_B)
    mockBalanceOf(OWNER_A, 1)

    // Transfer one token to OWNER_B
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B))

    // OWNER_A should now have tokenCount = 1
    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '1')
    // OWNER_B should now have tokenCount = 1
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '1')
  })

  test('decrements ownerDaoCount when transferring last token away', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 1)
    seedProfile(OWNER_B, 0, 0, 0)
    seedOwnerRows(OWNER_A, OWNER_A)

    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(OWNER_B, OWNER_B)
    mockBalanceOf(OWNER_A, 0)

    // Transfer last token to OWNER_B
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B))

    // OWNER_A should have ownerDaoCount decremented to 0
    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '0')

    // OWNER_B should have ownerDaoCount incremented to 1
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '1')
  })

  test('decrements voterDaoCount when changing delegation from self with last token', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 1, 1, 1)
    seedProfile(OWNER_B, 0, 0, 1)

    const ownerId = TOKEN_ADDRESS + ':' + OWNER_A
    const owner = new DAOTokenOwner(ownerId)
    owner.dao = TOKEN_ADDRESS
    owner.owner = Address.fromString(OWNER_A)
    owner.delegate = Address.fromString(OWNER_A)
    owner.profile = OWNER_A
    owner.daoTokenCount = 1
    owner.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    owner.save()

    const voterId = TOKEN_ADDRESS + ':' + OWNER_A
    const voter = new DAOVoter(voterId)
    voter.dao = TOKEN_ADDRESS
    voter.voter = Address.fromString(OWNER_A)
    voter.profile = OWNER_A
    voter.daoTokenCount = 1
    voter.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    voter.save()

    mockBalanceOf(OWNER_A, 1)

    // Change delegation from self to OWNER_B
    handleDelegateChanged(createDelegateChangedEvent(OWNER_A, OWNER_A, OWNER_B))

    // OWNER_A should have voterDaoCount decremented to 0
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')

    // OWNER_B should have voterDaoCount incremented to 2 (was 1, now 2)
    assert.fieldEquals('Profile', OWNER_B, 'voterDaoCount', '2')
  })

  test('handles complex scenario: multiple transfers and delegation changes', () => {
    clearStore()
    seedDao()
    seedProfile(OWNER_A, 3, 1, 1)
    seedProfile(OWNER_B, 0, 0, 0)
    seedProfile(OWNER_C, 0, 0, 0)

    // Create owner with 3 tokens
    const ownerId = TOKEN_ADDRESS + ':' + OWNER_A
    const owner = new DAOTokenOwner(ownerId)
    owner.dao = TOKEN_ADDRESS
    owner.owner = Address.fromString(OWNER_A)
    owner.delegate = Address.fromString(OWNER_A)
    owner.profile = OWNER_A
    owner.daoTokenCount = 3
    owner.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    owner.save()

    const voterId = TOKEN_ADDRESS + ':' + OWNER_A
    const voter = new DAOVoter(voterId)
    voter.dao = TOKEN_ADDRESS
    voter.voter = Address.fromString(OWNER_A)
    voter.profile = OWNER_A
    voter.daoTokenCount = 3
    voter.lastActiveAt = BigInt.fromI32(TIMESTAMP)
    voter.save()

    mockDelegates(OWNER_A, OWNER_A)
    mockDelegates(OWNER_B, OWNER_B)
    mockDelegates(OWNER_C, OWNER_C)
    mockBalanceOf(OWNER_A, 2)
    mockTokenURI(1, 'ipfs://token1')
    mockTokenName('Token1')

    // Transfer 1 token to OWNER_B
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 1))

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '2')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '1')

    mockBalanceOf(OWNER_A, 1)
    mockTokenURI(2, 'ipfs://token2')
    mockTokenName('Token2')

    // Transfer another token to OWNER_C
    handleTransfer(createTransferEvent(OWNER_A, OWNER_C, 2))

    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '1')
    assert.fieldEquals('Profile', OWNER_C, 'tokenCount', '1')
    assert.fieldEquals('Profile', OWNER_C, 'ownerDaoCount', '1')

    mockBalanceOf(OWNER_A, 0)
    mockTokenURI(3, 'ipfs://token3')
    mockTokenName('Token3')

    // Transfer last token to OWNER_B
    handleTransfer(createTransferEvent(OWNER_A, OWNER_B, 3))

    // OWNER_A should have all counts at 0
    assert.fieldEquals('Profile', OWNER_A, 'tokenCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'ownerDaoCount', '0')
    assert.fieldEquals('Profile', OWNER_A, 'voterDaoCount', '0')

    // OWNER_B should have 2 tokens
    assert.fieldEquals('Profile', OWNER_B, 'tokenCount', '2')
    assert.fieldEquals('Profile', OWNER_B, 'ownerDaoCount', '1')
  })
})
