import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  dataSource,
  log,
} from '@graphprotocol/graph-ts'

import {
  CandidateSponsorSignature,
  CandidateSubmittedAsProposalEvent,
  DAO,
  Proposal,
  ProposalCandidateVersion,
  ProposalCreatedEvent as ProposalCreatedFeedEvent,
  ProposalEditedEvent,
  ProposalExecutedEvent as ProposalExecutedFeedEvent,
  ProposalSigner,
  ProposalVote,
  ProposalVotedEvent as ProposalVotedFeedEvent,
} from '../generated/schema'
import {
  Governor as GovernorContract,
  ProposalCanceled as ProposalCanceledEvent,
  ProposalCreated as ProposalCreatedEvent,
  ProposalExecuted as ProposalExecutedEvent,
  ProposalQueued as ProposalQueuedEvent,
  ProposalSignersSet as ProposalSignersSetEvent,
  ProposalUpdatablePeriodUpdated as ProposalUpdatablePeriodUpdatedEvent,
  ProposalUpdated as ProposalUpdatedEvent,
  ProposalVetoed as ProposalVetoedEvent,
  VoteCast as VoteCastEvent,
} from '../generated/templates/Governor/Governor'
import { Token as TokenContract } from '../generated/templates/Governor/Token'
import { Treasury as TreasuryContract } from '../generated/templates/Governor/Treasury'
import { parseDescriptionFields } from './utils/proposalMetadata'

function buildCalldatas(calldatasBytes: Bytes[]): string | null {
  let calldatas: string = ''
  for (let i = 0; i < calldatasBytes.length; i++) {
    if (i == 0) calldatas = calldatasBytes[i].toHexString()
    else calldatas = calldatas + ':' + calldatasBytes[i].toHexString()
  }
  return calldatas.length > 1 ? calldatas : null
}

function buildTargets(targetsInput: Address[]): Bytes[] {
  let targets: Bytes[] = []
  for (let i = 0; i < targetsInput.length; i++) {
    targets[i] = targetsInput[i]
  }
  return targets
}

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  let context = dataSource.context()
  let dao = DAO.load(context.getString('tokenAddress'))
  if (dao == null) return

  let newProposalCount = dao.proposalCount + 1

  dao.proposalCount = newProposalCount

  let proposal = new Proposal(event.params.proposalId.toHexString())

  proposal.proposalId = event.params.proposalId
  proposal.proposalNumber = newProposalCount

  proposal.targets = buildTargets(event.params.targets)
  proposal.calldatas = buildCalldatas(event.params.calldatas)
  let descriptionMetadata = event.params.description
  let parsedDescription = parseDescriptionFields(descriptionMetadata)
  let title = parsedDescription[0].length > 0 ? parsedDescription[0] : null
  let description = parsedDescription[1].length > 0 ? parsedDescription[1] : null
  let representedAddress = parsedDescription[2].length > 0 ? parsedDescription[2] : null
  let discussionUrl = parsedDescription[3].length > 0 ? parsedDescription[3] : null

  proposal.values = event.params.values
  proposal.title = title
  proposal.description = description
  proposal.metadata = descriptionMetadata
  proposal.representedAddress = representedAddress
  proposal.discussionUrl = discussionUrl
  proposal.descriptionHash = event.params.descriptionHash
  proposal.proposer = event.params.proposal.proposer
  proposal.timeCreated = event.params.proposal.timeCreated
  proposal.updatedAt = event.block.timestamp
  proposal.againstVotes = event.params.proposal.againstVotes.toI32()
  proposal.forVotes = event.params.proposal.forVotes.toI32()
  proposal.abstainVotes = event.params.proposal.abstainVotes.toI32()
  proposal.voteStart = event.params.proposal.voteStart
  proposal.voteEnd = event.params.proposal.voteEnd
  proposal.proposalThreshold = event.params.proposal.proposalThreshold
  proposal.quorumVotes = event.params.proposal.quorumVotes
  proposal.executed = event.params.proposal.executed
  proposal.canceled = event.params.proposal.canceled
  proposal.vetoed = event.params.proposal.vetoed
  proposal.queued = false
  proposal.dao = dao.id
  proposal.voteCount = 0
  proposal.snapshotBlockNumber = event.block.number
  let governorContract = GovernorContract.bind(event.address)
  let proposalUpdatablePeriodResult = governorContract.try_proposalUpdatablePeriod()
  if (!proposalUpdatablePeriodResult.reverted) {
    proposal.updatePeriodEnd = proposal.timeCreated.plus(
      proposalUpdatablePeriodResult.value
    )
  }
  proposal.replacedBy = null
  proposal.replaces = null
  proposal.updateMessage = null
  proposal.updateCount = 0
  proposal.isSigned = false
  proposal.candidateVersion = null
  proposal.transactionHash = event.transaction.hash

  dao.save()
  proposal.save()

  // Note: Candidate version linking happens later after processing signers (see lines ~274-293)
  // This allows us to find the version through the signature lookup

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new ProposalCreatedFeedEvent(feedEventId)
  feedEvent.type = 'PROPOSAL_CREATED'
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = proposal.proposer
  feedEvent.proposal = proposal.id
  feedEvent.save()
}

export function handleProposalUpdated(event: ProposalUpdatedEvent): void {
  let oldProposal = Proposal.load(event.params.oldProposalId.toHexString())
  if (oldProposal == null) {
    log.warning('Old proposal not found for replacement: {}', [
      event.params.oldProposalId.toHexString(),
    ])
    return
  }

  let proposal = new Proposal(event.params.newProposalId.toHexString())
  proposal.proposalId = event.params.newProposalId
  proposal.proposalNumber = oldProposal.proposalNumber
  proposal.dao = oldProposal.dao
  proposal.targets = buildTargets(event.params.targets)
  proposal.values = event.params.values
  proposal.calldatas = buildCalldatas(event.params.calldatas)

  let descriptionMetadata = event.params.description
  let parsedDescription = parseDescriptionFields(descriptionMetadata)
  proposal.title = parsedDescription[0].length > 0 ? parsedDescription[0] : null
  proposal.description = parsedDescription[1].length > 0 ? parsedDescription[1] : null
  proposal.metadata = descriptionMetadata
  proposal.representedAddress =
    parsedDescription[2].length > 0 ? parsedDescription[2] : null
  proposal.discussionUrl = parsedDescription[3].length > 0 ? parsedDescription[3] : null
  proposal.descriptionHash = Bytes.fromByteArray(
    crypto.keccak256(ByteArray.fromUTF8(descriptionMetadata))
  )
  proposal.proposer = event.params.proposer

  let governorContract = GovernorContract.bind(event.address)
  let proposalResult = governorContract.try_getProposal(event.params.newProposalId)
  if (proposalResult.reverted) {
    log.warning('Failed to load new proposal from governor: {}', [
      event.params.newProposalId.toHexString(),
    ])
    return
  }

  let proposalData = proposalResult.value
  proposal.timeCreated = proposalData.timeCreated
  proposal.updatedAt = event.block.timestamp
  proposal.againstVotes = proposalData.againstVotes.toI32()
  proposal.forVotes = proposalData.forVotes.toI32()
  proposal.abstainVotes = proposalData.abstainVotes.toI32()
  proposal.voteStart = proposalData.voteStart
  proposal.voteEnd = proposalData.voteEnd
  proposal.proposalThreshold = proposalData.proposalThreshold
  proposal.quorumVotes = proposalData.quorumVotes
  proposal.executed = proposalData.executed
  proposal.canceled = proposalData.canceled
  proposal.vetoed = proposalData.vetoed
  proposal.queued = false
  proposal.voteCount = 0

  proposal.snapshotBlockNumber = oldProposal.snapshotBlockNumber
  proposal.updatePeriodEnd = null
  let proposalUpdatablePeriodResult = governorContract.try_proposalUpdatablePeriod()
  if (!proposalUpdatablePeriodResult.reverted) {
    proposal.updatePeriodEnd = proposal.timeCreated.plus(
      proposalUpdatablePeriodResult.value
    )
  }

  proposal.replaces = oldProposal.id
  proposal.replacedBy = null
  proposal.updateMessage = event.params.updateMessage
  proposal.updateCount = oldProposal.updateCount + 1
  proposal.isSigned = oldProposal.isSigned
  proposal.candidateVersion = oldProposal.candidateVersion
  proposal.transactionHash = event.transaction.hash

  oldProposal.replacedBy = proposal.id
  oldProposal.save()
  proposal.save()

  if (proposal.candidateVersion != null) {
    let candidateVersion = ProposalCandidateVersion.load(proposal.candidateVersion!)
    if (candidateVersion) {
      candidateVersion.proposal = proposal.id
      candidateVersion.save()
    }
  }

  // Create ProposalEditedEvent for on-chain proposal edits
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new ProposalEditedEvent(feedEventId)
  feedEvent.type = 'PROPOSAL_EDITED'
  feedEvent.dao = proposal.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = proposal.proposer
  feedEvent.proposal = proposal.id
  feedEvent.previousProposal = oldProposal.id
  feedEvent.save()
}

export function handleProposalSignersSet(event: ProposalSignersSetEvent): void {
  let proposal = Proposal.load(event.params.proposalId.toHexString())
  if (proposal == null) {
    log.warning('Proposal not found for signers: {}', [
      event.params.proposalId.toHexString(),
    ])
    return
  }

  proposal.isSigned = true

  let governorContract = GovernorContract.bind(event.address)
  let tokenResult = governorContract.try_token()
  if (tokenResult.reverted) {
    log.warning('Failed to load token for proposal signers: {}', [
      event.params.proposalId.toHexString(),
    ])
    return
  }

  let tokenContract = TokenContract.bind(tokenResult.value)
  for (let i = 0; i < event.params.signers.length; i++) {
    let signer = event.params.signers[i]
    let signerId = proposal.id + '-' + signer.toHexString()
    let proposalSigner = new ProposalSigner(signerId)
    proposalSigner.proposal = proposal.id
    proposalSigner.signer = signer
    let votingPowerResult = tokenContract.try_getVotes(signer)
    proposalSigner.voteWeight = votingPowerResult.reverted
      ? BigInt.fromI32(0)
      : votingPowerResult.value
    proposalSigner.timestamp = event.block.timestamp
    proposalSigner.save()
  }

  // Try to find matching candidate version via first signer's signature
  // This only works for proposals created with proposeBySigs
  let candidateVersion: ProposalCandidateVersion | null = null

  if (event.params.signers.length > 0) {
    let firstSigner = event.params.signers[0]
    let signatureId = proposal.proposalId.toHexString() + '-' + firstSigner.toHexString()
    let signature = CandidateSponsorSignature.load(signatureId)

    if (signature) {
      // Found the signature - get the candidate version
      candidateVersion = ProposalCandidateVersion.load(signature.version)
    }
  }

  if (candidateVersion) {
    proposal.candidateVersion = candidateVersion.id
    candidateVersion.proposal = proposal.id
    candidateVersion.save()

    // Create CandidateSubmittedAsProposalEvent
    let feedEventId =
      event.transaction.hash.toHex() + '-submitted-' + event.logIndex.toString()
    let feedEvent = new CandidateSubmittedAsProposalEvent(feedEventId)
    feedEvent.type = 'CANDIDATE_SUBMITTED_AS_PROPOSAL'
    feedEvent.dao = proposal.dao
    feedEvent.timestamp = event.block.timestamp
    feedEvent.blockNumber = event.block.number
    feedEvent.transactionHash = event.transaction.hash
    feedEvent.actor = proposal.proposer
    feedEvent.proposal = proposal.id
    feedEvent.candidateVersion = candidateVersion.id
    feedEvent.group = candidateVersion.group
    feedEvent.save()
  }

  proposal.save()
}

export function handleProposalUpdatablePeriodUpdated(
  event: ProposalUpdatablePeriodUpdatedEvent
): void {
  log.info('Proposal updatable period updated from {} to {}', [
    event.params.prevProposalUpdatablePeriod.toString(),
    event.params.newProposalUpdatablePeriod.toString(),
  ])
}

export function handleProposalQueued(event: ProposalQueuedEvent): void {
  let context = dataSource.context()
  let treasuryAddress = context.getString('treasuryAddress')
  let treasuryContract = TreasuryContract.bind(Address.fromString(treasuryAddress))

  let proposal = Proposal.load(event.params.proposalId.toHexString())
  if (proposal == null) return

  proposal.executableFrom = event.params.eta
  proposal.expiresAt = event.params.eta.plus(treasuryContract.gracePeriod())
  proposal.queued = true
  proposal.queuedAt = event.block.timestamp
  proposal.queuedTransactionHash = event.transaction.hash
  proposal.save()
}

export function handleProposalExecuted(event: ProposalExecutedEvent): void {
  let proposal = Proposal.load(event.params.proposalId.toHexString())
  if (proposal == null) return

  proposal.executed = true
  proposal.executedAt = event.block.timestamp
  proposal.executionTransactionHash = event.transaction.hash
  proposal.queued = false
  proposal.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new ProposalExecutedFeedEvent(feedEventId)
  feedEvent.type = 'PROPOSAL_EXECUTED'
  feedEvent.dao = proposal.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.transaction.from
  feedEvent.proposal = proposal.id
  feedEvent.save()
}

export function handleProposalCanceled(event: ProposalCanceledEvent): void {
  let proposal = Proposal.load(event.params.proposalId.toHexString())
  if (proposal == null) return

  proposal.canceled = true
  proposal.canceledAt = event.block.timestamp
  proposal.cancelTransactionHash = event.transaction.hash
  proposal.queued = false
  proposal.save()
}

export function handleProposalVetoed(event: ProposalVetoedEvent): void {
  let proposal = Proposal.load(event.params.proposalId.toHexString())
  if (proposal == null) return

  proposal.vetoed = true
  proposal.vetoedAt = event.block.timestamp
  proposal.vetoTransactionHash = event.transaction.hash
  proposal.queued = false
  proposal.save()
}

export function handleVoteCast(event: VoteCastEvent): void {
  let proposalId = event.params.proposalId.toHexString()
  let proposal = Proposal.load(proposalId)
  if (proposal == null) return

  let proposalVote = new ProposalVote(
    `${event.transaction.hash.toHexString()}:${event.logIndex.toString()}`
  )

  proposalVote.transactionHash = event.transaction.hash
  proposalVote.timestamp = event.block.timestamp
  proposalVote.voter = event.params.voter
  proposalVote.weight = event.params.weight.toI32()
  proposalVote.reason = event.params.reason.length > 0 ? event.params.reason : null
  proposalVote.proposal = proposalId

  let support = event.params.support
  let weight = event.params.weight.toI32()
  // If the vote is against:
  if (support.equals(BigInt.fromI32(0))) {
    proposal.againstVotes = proposal.againstVotes + weight
    proposalVote.support = 'AGAINST'
    // Else if the vote is for:
  } else if (support.equals(BigInt.fromI32(1))) {
    proposal.forVotes = proposal.forVotes + weight
    proposalVote.support = 'FOR'
    // Else if the vote is to abstain:
  } else if (support.equals(BigInt.fromI32(2))) {
    proposal.abstainVotes = proposal.abstainVotes + weight
    proposalVote.support = 'ABSTAIN'
  } else {
    log.error('Unknown vote support type: {}', [support.toString()])
  }

  proposal.voteCount = proposal.voteCount + 1

  proposal.save()
  proposalVote.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new ProposalVotedFeedEvent(feedEventId)
  feedEvent.type = 'PROPOSAL_VOTED'
  feedEvent.dao = proposal.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = proposalVote.voter
  feedEvent.proposal = proposalVote.proposal
  feedEvent.vote = proposalVote.id
  feedEvent.save()
}
