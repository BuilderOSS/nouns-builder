import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  createMockedFunction,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import { Attested } from '../generated/EAS/EAS'
import {
  AuctionConfig,
  CandidateSponsorSignature,
  DAO,
  Proposal,
  ProposalCandidateGroup,
  ProposalCandidateVersion,
} from '../generated/schema'
import { handleAttested } from '../src/eas'
import {
  CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID,
  PROPOSAL_CANDIDATE_SCHEMA_UID,
} from '../src/utils/eas'

const TOKEN_ADDRESS = '0x00000000000000000000000000000000000000aa'
const GOVERNOR_ADDRESS = '0x00000000000000000000000000000000000000bb'
const EAS_ADDRESS = '0x00000000000000000000000000000000000000cc'
const PROPOSER = '0x00000000000000000000000000000000000000dd'
const SIGNER = '0x00000000000000000000000000000000000000ee'
const CANDIDATE_ATTESTATION_UID =
  '0x5555555555555555555555555555555555555555555555555555555555555555'
const CANDIDATE_ID = '0x4de19644aad2210f27759bfca422f383a66425039fddb8d40abcb407caa18568'
const CANDIDATE_PROPOSAL_HASH =
  '0x7777777777777777777777777777777777777777777777777777777777777777'
const EXISTING_PROPOSAL_ID =
  '0x8888888888888888888888888888888888888888888888888888888888888888'
const CANDIDATE_DESCRIPTION =
  '{"version":1,"title":"Test candidate","description":"Candidate description","transactionBundles":[]}'
const GROUP_ID = '0x1111111111111111111111111111111111111111111111111111111111111111'
const VERSION_ID = '0x2222222222222222222222222222222222222222222222222222222222222222'
const PROPOSAL_ID = '0x3333333333333333333333333333333333333333333333333333333333333333'
const SIGNATURE_ID = '0x4444444444444444444444444444444444444444444444444444444444444444'
function repeatHexByte(byte: string, count: i32): string {
  let out = '0x'
  for (let i = 0; i < count; i++) {
    out += byte
  }
  return out
}

function seedDao(): void {
  const auctionConfig = new AuctionConfig(TOKEN_ADDRESS)
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
  dao.governorAddress = Address.fromString(GOVERNOR_ADDRESS)
  dao.ownerCount = 0
  dao.voterCount = 0
  dao.tokensCount = 0
  dao.proposalCount = 0
  dao.candidateCount = 0
  dao.totalAuctionSales = BigInt.fromI32(0)
  dao.auctionConfig = auctionConfig.id
  dao.save()
}

function seedCandidateGroup(
  candidateId: string = GROUP_ID,
  proposalHash: string = PROPOSAL_ID,
  attestationUID: string = VERSION_ID,
  linkedProposalId: string = ''
): void {
  const group = new ProposalCandidateGroup(candidateId)
  group.dao = TOKEN_ADDRESS
  group.proposer = Address.fromString(PROPOSER)
  group.salt = Bytes.fromHexString(
    '0x5555555555555555555555555555555555555555555555555555555555555555'
  )
  group.createdAt = BigInt.fromI32(1)
  group.candidateNumber = 1
  group.versionCount = BigInt.fromI32(1)
  group.commentCount = BigInt.fromI32(0)
  group.latestVersionNumber = BigInt.fromI32(1)
  group.currentForCount = BigInt.fromI32(0)
  group.currentAgainstCount = BigInt.fromI32(0)
  group.currentAbstainCount = BigInt.fromI32(0)
  group.save()

  // Use composite ID: candidateId-proposalHash
  const versionId = candidateId + '-' + proposalHash

  const version = new ProposalCandidateVersion(versionId)
  version.group = candidateId
  version.candidateId = Bytes.fromHexString(candidateId)
  version.salt = Bytes.fromHexString(
    '0x5555555555555555555555555555555555555555555555555555555555555555'
  )
  version.attester = Address.fromString(PROPOSER)
  version.versionNumber = BigInt.fromI32(1)
  version.targets = [Address.fromString(TOKEN_ADDRESS)]
  version.values = [BigInt.fromI32(0)]
  version.calldatas = [Bytes.fromHexString('0x1234')]
  version.title = 'Test candidate'
  version.description = 'Candidate description'
  version.metadata =
    '{"version":1,"title":"Test candidate","description":"Candidate description","transactionBundles":[]}'
  version.proposalHash = Bytes.fromHexString(proposalHash)
  version.attestationUID = Bytes.fromHexString(attestationUID)
  version.createdAt = BigInt.fromI32(1)
  version.signatureCount = BigInt.fromI32(0)
  version.totalVoteWeight = BigInt.fromI32(0)
  version.revoked = false
  if (linkedProposalId.length > 0) {
    version.proposal = linkedProposalId
  }
  version.save()
}

function seedProposal(proposalId: string): void {
  const proposal = new Proposal(proposalId)
  proposal.proposalId = Bytes.fromHexString(proposalId)
  proposal.proposalNumber = 1
  proposal.dao = TOKEN_ADDRESS
  proposal.targets = [Bytes.fromHexString(TOKEN_ADDRESS)]
  proposal.values = [BigInt.fromI32(0)]
  proposal.calldatas = '0x1234'
  proposal.title = 'Existing proposal'
  proposal.description = 'Existing proposal description'
  proposal.metadata = CANDIDATE_DESCRIPTION
  proposal.representedAddress = ''
  proposal.discussionUrl = ''
  proposal.descriptionHash = Bytes.fromHexString(
    '0x1086d4f633d0291e07eb8e6ef5d51179974ae18fe827b00cb10b4bc8d6f56bf9'
  )
  proposal.proposer = Address.fromString(PROPOSER)
  proposal.timeCreated = BigInt.fromI32(1)
  proposal.updatedAt = BigInt.fromI32(1)
  proposal.againstVotes = 0
  proposal.forVotes = 0
  proposal.abstainVotes = 0
  proposal.voteStart = BigInt.fromI32(1)
  proposal.voteEnd = BigInt.fromI32(2)
  proposal.proposalThreshold = BigInt.fromI32(0)
  proposal.quorumVotes = BigInt.fromI32(0)
  proposal.executed = false
  proposal.canceled = false
  proposal.vetoed = false
  proposal.queued = false
  proposal.voteCount = 0
  proposal.snapshotBlockNumber = BigInt.fromI32(1)
  proposal.updatePeriodEnd = null
  proposal.replacedBy = null
  proposal.replaces = null
  proposal.updateMessage = null
  proposal.updateCount = 0
  proposal.isSigned = false
  proposal.candidateVersion = null
  proposal.transactionHash = Bytes.fromHexString(
    '0x9999999999999999999999999999999999999999999999999999999999999999'
  )
  proposal.save()
}

function mockHashProposal(returnValue: string): void {
  const metadataHash = Bytes.fromHexString(
    '0x1086d4f633d0291e07eb8e6ef5d51179974ae18fe827b00cb10b4bc8d6f56bf9'
  )
  createMockedFunction(
    Address.fromString(GOVERNOR_ADDRESS),
    'hashProposal',
    'hashProposal(address[],uint256[],bytes[],bytes32,address):(bytes32)'
  )
    .withArgs([
      ethereum.Value.fromAddressArray([Address.fromString(TOKEN_ADDRESS)]),
      ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(0)]),
      ethereum.Value.fromBytesArray([Bytes.fromHexString('0x1234')]),
      ethereum.Value.fromFixedBytes(metadataHash),
      ethereum.Value.fromAddress(Address.fromString(PROPOSER)),
    ])
    .returns([ethereum.Value.fromFixedBytes(Bytes.fromHexString(returnValue))])
}

function mockProposalSignatureNonce(nonce: i32): void {
  createMockedFunction(
    Address.fromString(GOVERNOR_ADDRESS),
    'proposeSignatureNonce',
    'proposeSignatureNonce(address):(uint256)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(SIGNER))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(nonce))])
}

function mockTokenVotes(votes: i32): void {
  createMockedFunction(
    Address.fromString(TOKEN_ADDRESS),
    'getVotes',
    'getVotes(address):(uint256)'
  )
    .withArgs([ethereum.Value.fromAddress(Address.fromString(SIGNER))])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(votes))])
}

function encodeSignatureData(): Bytes {
  const tuple = new ethereum.Tuple()
  // New schema: (bytes32 candidateId, bytes32 proposalHash, uint256 nonce, uint256 deadline, bytes signature)
  tuple.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(GROUP_ID))) // candidateId
  tuple.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(PROPOSAL_ID))) // proposalHash
  tuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(7))) // nonce
  tuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000000000))) // deadline
  tuple.push(ethereum.Value.fromBytes(Bytes.fromHexString(repeatHexByte('11', 65)))) // signature

  return changetype<Bytes>(ethereum.encode(ethereum.Value.fromTuple(tuple)))
}

function mockAttestation(data: Bytes): void {
  const attestationTuple = new ethereum.Tuple()
  attestationTuple.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(SIGNATURE_ID)))
  attestationTuple.push(
    ethereum.Value.fromFixedBytes(CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID)
  )
  attestationTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  attestationTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  attestationTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  attestationTuple.push(
    ethereum.Value.fromFixedBytes(
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
    )
  )
  attestationTuple.push(ethereum.Value.fromAddress(Address.fromString(TOKEN_ADDRESS)))
  attestationTuple.push(ethereum.Value.fromAddress(Address.fromString(SIGNER)))
  attestationTuple.push(ethereum.Value.fromBoolean(true))
  attestationTuple.push(ethereum.Value.fromBytes(data))

  createMockedFunction(
    Address.fromString(EAS_ADDRESS),
    'getAttestation',
    'getAttestation(bytes32):((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))'
  )
    .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString(SIGNATURE_ID))])
    .returns([ethereum.Value.fromTuple(attestationTuple)])
}

function createAttestedEvent(): Attested {
  const event = newTypedMockEvent<Attested>()
  event.address = Address.fromString(EAS_ADDRESS)
  event.parameters = [
    new ethereum.EventParam(
      'recipient',
      ethereum.Value.fromAddress(Address.fromString(TOKEN_ADDRESS))
    ),
    new ethereum.EventParam(
      'attester',
      ethereum.Value.fromAddress(Address.fromString(SIGNER))
    ),
    new ethereum.EventParam(
      'uid',
      ethereum.Value.fromFixedBytes(Bytes.fromHexString(SIGNATURE_ID))
    ),
    new ethereum.EventParam(
      'schema',
      ethereum.Value.fromFixedBytes(CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID)
    ),
  ]
  return event
}

describe('Candidate sponsor signature indexing', () => {
  test('ignores proposer signatures', () => {
    clearStore()
    seedDao()
    seedCandidateGroup()

    mockAttestation(encodeSignatureData())

    const event = createAttestedEvent()
    event.parameters[1] = new ethereum.EventParam(
      'attester',
      ethereum.Value.fromAddress(Address.fromString(PROPOSER))
    )

    handleAttested(event)

    // Composite ID is proposalHash-signerAddress
    const compositeId = PROPOSAL_ID + '-' + PROPOSER.toLowerCase()
    assert.assertTrue(CandidateSponsorSignature.load(compositeId) == null)
  })

  test('ignores signatures with a bad proposal hash', () => {
    clearStore()
    seedDao()
    seedCandidateGroup()

    mockAttestation(encodeSignatureData())
    mockHashProposal('0x7777777777777777777777777777777777777777777777777777777777777777')
    mockProposalSignatureNonce(7)
    mockTokenVotes(10)

    handleAttested(createAttestedEvent())

    // Composite ID is proposalHash-signerAddress
    const compositeId = PROPOSAL_ID + '-' + SIGNER.toLowerCase()
    assert.assertTrue(CandidateSponsorSignature.load(compositeId) == null)
  })

  test('ignores signatures with a bad nonce', () => {
    clearStore()
    seedDao()
    seedCandidateGroup()

    mockAttestation(encodeSignatureData())
    mockHashProposal(PROPOSAL_ID)
    mockProposalSignatureNonce(8)
    mockTokenVotes(10)

    handleAttested(createAttestedEvent())

    // Composite ID is proposalHash-signerAddress
    const compositeId = PROPOSAL_ID + '-' + SIGNER.toLowerCase()
    assert.assertTrue(CandidateSponsorSignature.load(compositeId) == null)
  })
})

describe('Candidate proposal attestation linking', () => {
  test('keeps an existing proposal link on duplicate attestation', () => {
    clearStore()
    seedDao()
    seedProposal(EXISTING_PROPOSAL_ID)
    seedCandidateGroup(
      CANDIDATE_ID,
      CANDIDATE_PROPOSAL_HASH,
      CANDIDATE_ATTESTATION_UID,
      EXISTING_PROPOSAL_ID
    )

    const attestationDataTuple = new ethereum.Tuple()
    attestationDataTuple.push(
      ethereum.Value.fromFixedBytes(Bytes.fromHexString(CANDIDATE_ID))
    )
    attestationDataTuple.push(
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString(
          '0x5555555555555555555555555555555555555555555555555555555555555555'
        )
      )
    )
    attestationDataTuple.push(
      ethereum.Value.fromAddressArray([Address.fromString(TOKEN_ADDRESS)])
    )
    attestationDataTuple.push(ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI32(0)]))
    attestationDataTuple.push(
      ethereum.Value.fromBytesArray([Bytes.fromHexString('0x1234')])
    )
    attestationDataTuple.push(ethereum.Value.fromString(CANDIDATE_DESCRIPTION))

    const attestationData = changetype<Bytes>(
      ethereum.encode(ethereum.Value.fromTuple(attestationDataTuple))
    )

    const attestationTuple = new ethereum.Tuple()
    attestationTuple.push(
      ethereum.Value.fromFixedBytes(Bytes.fromHexString(CANDIDATE_ATTESTATION_UID))
    )
    attestationTuple.push(ethereum.Value.fromFixedBytes(PROPOSAL_CANDIDATE_SCHEMA_UID))
    attestationTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
    attestationTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    attestationTuple.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    attestationTuple.push(
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
      )
    )
    attestationTuple.push(ethereum.Value.fromAddress(Address.fromString(TOKEN_ADDRESS)))
    attestationTuple.push(ethereum.Value.fromAddress(Address.fromString(PROPOSER)))
    attestationTuple.push(ethereum.Value.fromBoolean(true))
    attestationTuple.push(ethereum.Value.fromBytes(attestationData))

    createMockedFunction(
      Address.fromString(EAS_ADDRESS),
      'getAttestation',
      'getAttestation(bytes32):((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))'
    )
      .withArgs([
        ethereum.Value.fromFixedBytes(Bytes.fromHexString(CANDIDATE_ATTESTATION_UID)),
      ])
      .returns([ethereum.Value.fromTuple(attestationTuple)])

    mockHashProposal(CANDIDATE_PROPOSAL_HASH)

    const event = newTypedMockEvent<Attested>()
    event.address = Address.fromString(EAS_ADDRESS)
    event.parameters = [
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(TOKEN_ADDRESS))
      ),
      new ethereum.EventParam(
        'attester',
        ethereum.Value.fromAddress(Address.fromString(PROPOSER))
      ),
      new ethereum.EventParam(
        'uid',
        ethereum.Value.fromFixedBytes(Bytes.fromHexString(CANDIDATE_ATTESTATION_UID))
      ),
      new ethereum.EventParam(
        'schema',
        ethereum.Value.fromFixedBytes(PROPOSAL_CANDIDATE_SCHEMA_UID)
      ),
    ]

    handleAttested(event)

    const versionId = CANDIDATE_ID + '-' + CANDIDATE_PROPOSAL_HASH
    assert.fieldEquals(
      'ProposalCandidateVersion',
      versionId,
      'proposal',
      EXISTING_PROPOSAL_ID
    )
  })
})
