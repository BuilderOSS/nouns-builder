import { Address, Bytes } from '@graphprotocol/graph-ts'

import {
  Attested as AttestedEvent,
  EAS,
  Revoked as RevokedEvent,
} from '../generated/EAS/EAS'
import { DAO, DaoMultisigUpdate, Proposal, ProposalUpdate } from '../generated/schema'
import {
  DAO_MULTISIG_SCHEMA_UID,
  decodeDaoMultisig,
  decodePropdate,
  PROPDATE_SCHEMA_UID,
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

export function handleAttested(event: AttestedEvent): void {
  if (event.params.schema == DAO_MULTISIG_SCHEMA_UID) {
    handleDaoMultisigAttestation(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestation(event)
  }
}

export function handleRevoked(event: RevokedEvent): void {
  if (event.params.schema == DAO_MULTISIG_SCHEMA_UID) {
    handleDaoMultisigAttestationRevoked(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestationRevoked(event)
  }
}
