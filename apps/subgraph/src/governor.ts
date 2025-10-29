import { Address, BigInt, Bytes, dataSource, log } from '@graphprotocol/graph-ts'

import { 
  DAO, 
  Proposal, 
  ProposalVote,
  ProposalCreatedEvent as ProposalCreatedFeedEvent,
  ProposalVotedEvent as ProposalVotedFeedEvent,
  ProposalExecutedEvent as ProposalExecutedFeedEvent
} from '../generated/schema'
import {
  ProposalCanceled as ProposalCanceledEvent,
  ProposalCreated as ProposalCreatedEvent,
  ProposalExecuted as ProposalExecutedEvent,
  ProposalQueued as ProposalQueuedEvent,
  ProposalVetoed as ProposalVetoedEvent,
  VoteCast as VoteCastEvent,
} from '../generated/templates/Governor/Governor'
import { Treasury as TreasuryContract } from '../generated/templates/Governor/Treasury'

export function handleProposalCreated(event: ProposalCreatedEvent): void {
  let context = dataSource.context()
  let dao = DAO.load(context.getString('tokenAddress'))
  if (dao == null) return

  let newProposalCount = dao.proposalCount + 1

  dao.proposalCount = newProposalCount

  let proposal = new Proposal(event.params.proposalId.toHexString())

  proposal.proposalId = event.params.proposalId
  proposal.proposalNumber = newProposalCount

  // Loop through and build the targets array (bytes array copying not implemented in assemblyscript)
  let targets: Bytes[] = []
  for (let i = 0; i < event.params.targets.length; i++) {
    targets[i] = event.params.targets[i]
  }
  proposal.targets = targets

  // Loop through and build the calldatas string (bytes array was hitting index limits that strings do not have)
  let calldatas: string = ''
  for (let i = 0; i < event.params.calldatas.length; i++) {
    if (i == 0) calldatas = event.params.calldatas[i].toHexString()
    else calldatas = calldatas + ':' + event.params.calldatas[i].toHexString()
  }
  proposal.calldatas = calldatas.length > 1 ? calldatas : null

  let split = event.params.description.split('&&')
  let title = split.length > 0 && split[0].length > 0 ? split[0] : null
  let description = split.length > 1 && split[1].length > 0 ? split[1] : null

  proposal.values = event.params.values
  proposal.title = title
  proposal.description = description
  proposal.descriptionHash = event.params.descriptionHash
  proposal.proposer = event.params.proposal.proposer
  proposal.timeCreated = event.params.proposal.timeCreated
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
  proposal.transactionHash = event.transaction.hash

  dao.save()
  proposal.save()
  
  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let feedEvent = new ProposalCreatedFeedEvent(feedEventId)
  feedEvent.type = "PROPOSAL_CREATED"
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = proposal.proposer
  feedEvent.proposal = proposal.id
  feedEvent.save()
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
  let feedEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let feedEvent = new ProposalExecutedFeedEvent(feedEventId)
  feedEvent.type = "PROPOSAL_EXECUTED"
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
  let feedEventId = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let feedEvent = new ProposalVotedFeedEvent(feedEventId)
  feedEvent.type = "PROPOSAL_VOTED"
  feedEvent.dao = proposal.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = proposalVote.voter
  feedEvent.proposal = proposalVote.proposal
  feedEvent.vote = proposalVote.id
  feedEvent.save()
}
