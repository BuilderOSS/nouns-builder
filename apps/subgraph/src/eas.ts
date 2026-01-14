import { Address, Bytes } from '@graphprotocol/graph-ts'

import {
  Attested as AttestedEvent,
  EAS,
  Revoked as RevokedEvent,
} from '../generated/EAS/EAS'
import {
  DAO,
  DaoMultisigUpdate,
  Proposal,
  ProposalUpdate,
  ProposalUpdatedEvent as ProposalUpdatedFeedEvent,
  TreasuryAssetPin,
} from '../generated/schema'
import {
  DAO_MULTISIG_SCHEMA_UID,
  decodeDaoMultisig,
  decodePropdate,
  decodeTreasuryAssetPin,
  PROPDATE_SCHEMA_UID,
  TREASURY_ASSET_PIN_SCHEMA_UID,
} from './utils/eas'

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

export function handleAttested(event: AttestedEvent): void {
  if (event.params.schema == DAO_MULTISIG_SCHEMA_UID) {
    handleDaoMultisigAttestation(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestation(event)
  } else if (event.params.schema == TREASURY_ASSET_PIN_SCHEMA_UID) {
    handleTreasuryAssetPinAttestation(event)
  }
}

export function handleRevoked(event: RevokedEvent): void {
  if (event.params.schema == DAO_MULTISIG_SCHEMA_UID) {
    handleDaoMultisigAttestationRevoked(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestationRevoked(event)
  } else if (event.params.schema == TREASURY_ASSET_PIN_SCHEMA_UID) {
    handleTreasuryAssetPinRevoked(event)
  }
}
