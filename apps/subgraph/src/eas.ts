import { Address, BigInt, Bytes, crypto } from '@graphprotocol/graph-ts'

import {
  Attested as AttestedEvent,
  EAS,
  Revoked as RevokedEvent,
} from '../generated/EAS/EAS'
import { Token as TokenContract } from '../generated/EAS/Token'
import {
  CandidateComment,
  CandidateCommentCreatedEvent,
  CandidateSponsorSignature,
  CandidateSponsorSignatureCreatedEvent,
  CandidateVersionCreatedEvent,
  DAO,
  DaoMultisigUpdate,
  Proposal,
  ProposalCandidateGroup,
  ProposalCandidateVersion,
  ProposalUpdate,
  ProposalUpdatedEvent as ProposalUpdatedFeedEvent,
  TreasuryAssetPin,
} from '../generated/schema'
import { Governor as GovernorContract } from '../generated/templates/Governor/Governor'
import {
  CANDIDATE_COMMENT_SCHEMA_UID,
  CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID,
  DAO_MULTISIG_SCHEMA_UID,
  decodeCandidateComment,
  decodeCandidateSponsorSignature,
  decodeDaoMultisig,
  decodePropdate,
  decodeProposalCandidate,
  decodeTreasuryAssetPin,
  PROPDATE_SCHEMA_UID,
  PROPOSAL_CANDIDATE_SCHEMA_UID,
  TREASURY_ASSET_PIN_SCHEMA_UID,
} from './utils/eas'
import { parseDescriptionFields } from './utils/proposalMetadata'

const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

function getAttestation(address: Address, uid: Bytes): Bytes | null {
  const eas = EAS.bind(address)
  const attestation = eas.try_getAttestation(uid)
  if (!attestation.reverted) {
    return attestation.value.data
  }
  return null
}

function handlePropdateAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) {
    return
  }
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) {
    // ensure the dao token is the recipient
    return
  }
  const propdate = decodePropdate(data)
  if (!propdate) {
    return
  }
  const proposal = Proposal.load(propdate.proposalId.toHexString())
  if (!proposal) {
    return
  }
  const update = new ProposalUpdate(event.params.uid.toHexString())
  update.proposal = proposal.id
  update.transactionHash = event.transaction.hash
  update.timestamp = event.block.timestamp
  update.messageType = propdate.messageType
  update.message = propdate.message
  update.creator = event.params.attester
  update.originalMessageId = propdate.originalMessageId
  update.deleted = false
  update.save()

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new ProposalUpdatedFeedEvent(feedEventId)
  feedEvent.type = 'PROPOSAL_UPDATED'
  feedEvent.dao = proposal.dao
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = update.creator
  feedEvent.proposal = update.proposal
  feedEvent.update = update.id
  feedEvent.save()
}

function handleDaoMultisigAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) {
    return
  }
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) {
    // ensure the dao token is the recipient
    return
  }
  const daoMultisig = decodeDaoMultisig(data)
  if (!daoMultisig) {
    return
  }

  const update = new DaoMultisigUpdate(event.params.uid.toHexString())
  update.dao = dao.id
  update.transactionHash = event.transaction.hash
  update.timestamp = event.block.timestamp
  update.creator = event.params.attester
  update.daoMultisig = daoMultisig
  update.deleted = false
  update.save()
}

function handlePropdateAttestationRevoked(event: RevokedEvent): void {
  const update = ProposalUpdate.load(event.params.uid.toHexString())
  if (!update) {
    return
  }
  update.deleted = true
  update.save()
}

function handleDaoMultisigAttestationRevoked(event: RevokedEvent): void {
  const update = DaoMultisigUpdate.load(event.params.uid.toHexString())
  if (!update) {
    return
  }
  update.deleted = true
  update.save()
}

function handleTreasuryAssetPinAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) {
    return
  }
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) {
    // ensure the dao token is the recipient
    return
  }
  // ensure the dao treasury is the attester
  if (event.params.attester != dao.treasuryAddress) {
    return
  }

  const assetPin = decodeTreasuryAssetPin(data)
  if (!assetPin) {
    return
  }

  const pin = new TreasuryAssetPin(event.params.uid.toHexString())
  pin.dao = dao.id
  pin.transactionHash = event.transaction.hash
  pin.timestamp = event.block.timestamp
  pin.tokenType = assetPin.tokenType
  pin.token = assetPin.token
  pin.isCollection = assetPin.isCollection
  pin.tokenId = assetPin.tokenId
  pin.creator = event.params.attester
  pin.revoked = false
  pin.save()
}

function handleTreasuryAssetPinRevoked(event: RevokedEvent): void {
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) {
    // ensure the dao token is the recipient
    return
  }
  // ensure the dao treasury is the attester
  if (event.params.attester != dao.treasuryAddress) {
    return
  }
  const pin = TreasuryAssetPin.load(event.params.uid.toHexString())
  if (!pin) {
    return
  }
  pin.revoked = true
  pin.revokedAt = event.block.timestamp
  pin.revokedBy = event.params.attester
  pin.revokedTxHash = event.transaction.hash
  pin.save()
}

function loadOrCreateCandidateGroup(
  candidateId: Bytes,
  dao: DAO,
  proposer: Address,
  salt: Bytes,
  timestamp: BigInt
): ProposalCandidateGroup {
  let groupId = candidateId.toHexString()
  let group = ProposalCandidateGroup.load(groupId)
  if (!group) {
    group = new ProposalCandidateGroup(groupId)
    group.dao = dao.id
    group.proposer = proposer
    group.salt = salt
    group.createdAt = timestamp
    group.candidateNumber = dao.candidateCount + 1
    group.versionCount = BigInt.fromI32(0)
    group.commentCount = BigInt.fromI32(0)
    group.latestVersionNumber = BigInt.fromI32(0)
    group.currentForCount = BigInt.fromI32(0)
    group.currentAgainstCount = BigInt.fromI32(0)
    group.currentAbstainCount = BigInt.fromI32(0)
    group.leadingVersion = null
    dao.candidateCount = group.candidateNumber
    dao.save()
    group.save()
  }
  return group
}

function recomputeVersionSignatureAggregates(versionId: string): void {
  let version = ProposalCandidateVersion.load(versionId)
  if (!version) return

  let signatures = version.signatures.load()
  let count = BigInt.fromI32(0)
  let totalVoteWeight = BigInt.fromI32(0)

  for (let i = 0; i < signatures.length; i++) {
    let sig = signatures[i]
    if (!sig.revoked) {
      count = count.plus(BigInt.fromI32(1))
      totalVoteWeight = totalVoteWeight.plus(sig.voteWeight)
    }
  }

  version.signatureCount = count
  version.totalVoteWeight = totalVoteWeight
  version.save()
}

function recomputeGroupLeadingVersion(groupId: string): void {
  let group = ProposalCandidateGroup.load(groupId)
  if (!group) return

  let versions = group.versions.load()
  let leadingId: string | null = null
  let bestCount = BigInt.fromI32(-1)
  let bestVoteWeight = BigInt.fromI32(-1)
  let bestVersionNumber = BigInt.fromI32(-1)

  for (let i = 0; i < versions.length; i++) {
    let v = versions[i]
    if (v.revoked) continue

    let isBetter =
      v.signatureCount > bestCount ||
      (v.signatureCount == bestCount && v.totalVoteWeight > bestVoteWeight) ||
      (v.signatureCount == bestCount &&
        v.totalVoteWeight == bestVoteWeight &&
        v.versionNumber > bestVersionNumber)

    if (isBetter) {
      leadingId = v.id
      bestCount = v.signatureCount
      bestVoteWeight = v.totalVoteWeight
      bestVersionNumber = v.versionNumber
    }
  }

  group.leadingVersion = leadingId
  group.save()
}

function recomputeGroupVersionAggregates(groupId: string): void {
  let group = ProposalCandidateGroup.load(groupId)
  if (!group) return

  let versions = group.versions.load()
  let count = BigInt.fromI32(0)
  let latestVersionNumber = BigInt.fromI32(0)

  for (let i = 0; i < versions.length; i++) {
    let version = versions[i]
    if (version.revoked) continue
    count = count.plus(BigInt.fromI32(1))
    if (version.versionNumber > latestVersionNumber) {
      latestVersionNumber = version.versionNumber
    }
  }

  group.versionCount = count
  group.latestVersionNumber = latestVersionNumber
  group.save()
}

function recomputeGroupCommentCount(groupId: string): void {
  let group = ProposalCandidateGroup.load(groupId)
  if (!group) return

  let comments = group.comments.load()
  let count = BigInt.fromI32(0)
  for (let i = 0; i < comments.length; i++) {
    if (!comments[i].revoked) {
      count = count.plus(BigInt.fromI32(1))
    }
  }

  group.commentCount = count
  group.save()
}

function recomputeGroupSentiment(groupId: string): void {
  let group = ProposalCandidateGroup.load(groupId)
  if (!group) return

  let comments = group.comments.load()
  let latestUserKeys: string[] = []
  let latestComments: CandidateComment[] = []

  for (let i = 0; i < comments.length; i++) {
    let comment = comments[i]
    if (comment.revoked) continue

    let key = comment.commenter.toHexString()
    let found = -1
    for (let j = 0; j < latestUserKeys.length; j++) {
      if (latestUserKeys[j] == key) {
        found = j
        break
      }
    }
    if (found == -1) {
      latestUserKeys.push(key)
      latestComments.push(comment)
    } else if (comment.createdAt > latestComments[found].createdAt) {
      latestComments[found] = comment
    }
  }

  let forCount = BigInt.fromI32(0)
  let againstCount = BigInt.fromI32(0)
  let abstainCount = BigInt.fromI32(0)
  for (let i = 0; i < latestComments.length; i++) {
    let comment = latestComments[i]
    if (comment.support == 'FOR') forCount = forCount.plus(BigInt.fromI32(1))
    if (comment.support == 'AGAINST') againstCount = againstCount.plus(BigInt.fromI32(1))
    if (comment.support == 'ABSTAIN') abstainCount = abstainCount.plus(BigInt.fromI32(1))
  }

  group.currentForCount = forCount
  group.currentAgainstCount = againstCount
  group.currentAbstainCount = abstainCount
  group.save()
}

function handleProposalCandidateAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) return

  const decoded = decodeProposalCandidate(data)
  if (!decoded) return

  let dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) return

  let candidateId = decoded.candidateId
  let group = loadOrCreateCandidateGroup(
    candidateId,
    dao,
    event.params.attester,
    decoded.salt,
    event.block.timestamp
  )

  let versionId = event.params.uid.toHexString()
  let version = ProposalCandidateVersion.load(versionId)
  if (!version) {
    version = new ProposalCandidateVersion(versionId)
    version.group = group.id
    version.signatureCount = BigInt.fromI32(0)
    version.totalVoteWeight = BigInt.fromI32(0)
    version.revoked = false
  }

  let targets: Bytes[] = []
  for (let i = 0; i < decoded.targets.length; i++) {
    targets[i] = decoded.targets[i]
  }

  version.candidateId = candidateId
  version.salt = decoded.salt
  version.attester = event.params.attester
  version.versionNumber = decoded.versionNumber
  version.targets = targets
  version.values = decoded.values
  version.calldatas = decoded.calldatas
  version.metadata = decoded.description
  version.proposalId = decoded.proposalId
  version.createdAt = event.block.timestamp
  let parsedDescription = parseDescriptionFields(decoded.description)
  version.title = parsedDescription[0].length > 0 ? parsedDescription[0] : null
  version.description = parsedDescription[1].length > 0 ? parsedDescription[1] : null
  version.representedAddress =
    parsedDescription[2].length > 0 ? parsedDescription[2] : null
  version.discussionUrl = parsedDescription[3].length > 0 ? parsedDescription[3] : null
  version.save()
  recomputeGroupVersionAggregates(group.id)
  recomputeGroupLeadingVersion(group.id)

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new CandidateVersionCreatedEvent(feedEventId)
  feedEvent.type = 'CANDIDATE_VERSION_CREATED'
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.params.attester
  feedEvent.candidateVersion = version.id
  feedEvent.group = group.id
  feedEvent.save()
}

function handleCandidateCommentAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) return

  const decoded = decodeCandidateComment(data)
  if (!decoded) return

  let candidateId = decoded.candidateId
  let group = ProposalCandidateGroup.load(candidateId.toHexString())
  if (!group) return

  let dao = DAO.load(group.dao)
  if (!dao) return

  let comment = new CandidateComment(event.params.uid.toHexString())
  comment.group = group.id
  comment.candidate = candidateId
  comment.commenter = event.params.attester
  let tokenContract = TokenContract.bind(Address.fromBytes(dao.tokenAddress))
  let votes = tokenContract.try_getVotes(event.params.attester)
  comment.voteWeight = votes.reverted ? BigInt.fromI32(0) : votes.value
  if (decoded.support == 0) comment.support = 'FOR'
  else if (decoded.support == 1) comment.support = 'AGAINST'
  else if (decoded.support == 2) comment.support = 'ABSTAIN'
  else comment.support = 'NONE'
  comment.comment = decoded.comment
  let parentId = decoded.parentCommentUID.toHexString()
  comment.parentComment = parentId == ZERO_BYTES32 ? null : parentId
  comment.createdAt = event.block.timestamp
  comment.revoked = false
  comment.save()

  recomputeGroupCommentCount(group.id)
  recomputeGroupSentiment(group.id)

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new CandidateCommentCreatedEvent(feedEventId)
  feedEvent.type = 'CANDIDATE_COMMENT_CREATED'
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.params.attester
  feedEvent.comment = comment.id
  feedEvent.group = group.id
  feedEvent.save()
}

function handleCandidateSponsorSignatureAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) return

  const decoded = decodeCandidateSponsorSignature(data)
  if (!decoded) return

  let version = ProposalCandidateVersion.load(decoded.candidateVersionUID.toHexString())
  if (!version || version.proposalId != decoded.proposalId) return

  let group = ProposalCandidateGroup.load(version.group)
  if (!group) return

  if (event.params.attester.toHexString() == group.proposer.toHexString()) return

  if (decoded.signature.length != 65) return

  let dao = DAO.load(group.dao)
  if (!dao) return

  let governor = GovernorContract.bind(Address.fromBytes(dao.governorAddress))

  let targets: Address[] = []
  for (let i = 0; i < version.targets.length; i++) {
    targets.push(Address.fromBytes(version.targets[i]))
  }

  let metadataString = ''
  if (version.metadata != null) {
    metadataString = version.metadata as string
  }
  let descriptionHash = changetype<Bytes>(
    crypto.keccak256(Bytes.fromUTF8(metadataString))
  )

  let proposalHashResult = governor.try_hashProposal(
    targets,
    version.values,
    version.calldatas,
    descriptionHash,
    Address.fromBytes(group.proposer)
  )
  if (
    proposalHashResult.reverted ||
    proposalHashResult.value.toHexString() != decoded.proposalId.toHexString()
  ) {
    return
  }

  let nonceResult = governor.try_proposeSignatureNonce(event.params.attester)
  if (nonceResult.reverted || nonceResult.value != decoded.nonce) return

  if (decoded.deadline < event.block.timestamp) return

  let signature = new CandidateSponsorSignature(event.params.uid.toHexString())
  signature.version = version.id
  signature.signer = event.params.attester
  signature.proposalId = decoded.proposalId
  signature.nonce = decoded.nonce
  signature.deadline = decoded.deadline
  signature.signature = decoded.signature
  signature.revoked = false
  signature.createdAt = event.block.timestamp

  let tokenContract = TokenContract.bind(Address.fromBytes(dao.tokenAddress))
  let votes = tokenContract.try_getVotes(event.params.attester)
  signature.voteWeight = votes.reverted ? BigInt.fromI32(0) : votes.value
  signature.save()

  let versionId = version.id
  let groupId = version.group

  recomputeVersionSignatureAggregates(versionId)
  recomputeGroupLeadingVersion(groupId)

  // Create feed event
  let feedEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let feedEvent = new CandidateSponsorSignatureCreatedEvent(feedEventId)
  feedEvent.type = 'CANDIDATE_SPONSOR_SIGNATURE_CREATED'
  feedEvent.dao = dao.id
  feedEvent.timestamp = event.block.timestamp
  feedEvent.blockNumber = event.block.number
  feedEvent.transactionHash = event.transaction.hash
  feedEvent.actor = event.params.attester
  feedEvent.signature = signature.id
  feedEvent.candidateVersion = versionId
  feedEvent.group = groupId
  feedEvent.save()
}

function handleProposalCandidateRevoked(event: RevokedEvent): void {
  let version = ProposalCandidateVersion.load(event.params.uid.toHexString())
  if (!version) return
  version.revoked = true
  version.save()
  recomputeGroupVersionAggregates(version.group)
  recomputeGroupLeadingVersion(version.group)
}

function handleCandidateCommentRevoked(event: RevokedEvent): void {
  let comment = CandidateComment.load(event.params.uid.toHexString())
  if (!comment) return
  comment.revoked = true
  comment.save()

  recomputeGroupCommentCount(comment.group)
  recomputeGroupSentiment(comment.group)
}

function handleCandidateSponsorSignatureRevoked(event: RevokedEvent): void {
  let signature = CandidateSponsorSignature.load(event.params.uid.toHexString())
  if (!signature) return
  signature.revoked = true
  signature.save()

  let version = ProposalCandidateVersion.load(signature.version)
  if (!version) return
  recomputeVersionSignatureAggregates(version.id)
  recomputeGroupLeadingVersion(version.group)
}

export function handleAttested(event: AttestedEvent): void {
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) return

  if (event.params.schema == DAO_MULTISIG_SCHEMA_UID) {
    handleDaoMultisigAttestation(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestation(event)
  } else if (event.params.schema == TREASURY_ASSET_PIN_SCHEMA_UID) {
    handleTreasuryAssetPinAttestation(event)
  } else if (event.params.schema == PROPOSAL_CANDIDATE_SCHEMA_UID) {
    handleProposalCandidateAttestation(event)
  } else if (event.params.schema == CANDIDATE_COMMENT_SCHEMA_UID) {
    handleCandidateCommentAttestation(event)
  } else if (event.params.schema == CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID) {
    handleCandidateSponsorSignatureAttestation(event)
  }
}

export function handleRevoked(event: RevokedEvent): void {
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) return

  if (event.params.schema == DAO_MULTISIG_SCHEMA_UID) {
    handleDaoMultisigAttestationRevoked(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestationRevoked(event)
  } else if (event.params.schema == TREASURY_ASSET_PIN_SCHEMA_UID) {
    handleTreasuryAssetPinRevoked(event)
  } else if (event.params.schema == PROPOSAL_CANDIDATE_SCHEMA_UID) {
    handleProposalCandidateRevoked(event)
  } else if (event.params.schema == CANDIDATE_COMMENT_SCHEMA_UID) {
    handleCandidateCommentRevoked(event)
  } else if (event.params.schema == CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID) {
    handleCandidateSponsorSignatureRevoked(event)
  }
}
