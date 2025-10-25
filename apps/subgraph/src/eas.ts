import { Address, Bytes } from '@graphprotocol/graph-ts'

import {
  Attested as AttestedEvent,
  EAS,
  Revoked as RevokedEvent,
} from '../generated/EAS/EAS'
import { Governor } from '../generated/EAS/Governor'
import { Treasury } from '../generated/EAS/Treasury'
import { DAO, Proposal, ProposalUpdate } from '../generated/schema'
import {
  decodeEscrowDelegate,
  decodePropdate,
  ESCROW_DELEGATE_SCHEMA_UID,
  PROPDATE_SCHEMA_UID,
} from './utils/eas'

const zeroBytes32 = Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000000')

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
  const propdate = decodePropdate(data)
  if (!propdate) {
    return
  }
  const dao = DAO.load(event.params.recipient.toHexString())
  if (!dao) {
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
  if (propdate.originalMessageId.equals(zeroBytes32)) {
    // is zero hash for original update
    update.originalUpdate = null
  } else {
    update.originalUpdate = propdate.originalMessageId.toHexString()
  }
  update.deleted = false
  update.save()
}

function handleEscrowDelegateAttestation(event: AttestedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) {
    return
  }
  const escrowDelegate = decodeEscrowDelegate(data)
  if (!escrowDelegate) {
    return
  }
  const treasuryAddress = event.params.recipient
  const treasury = Treasury.bind(treasuryAddress)

  const ownerCall = treasury.try_owner()
  if (ownerCall.reverted) {
    return
  }
  const governorAddress = ownerCall.value
  const governor = Governor.bind(governorAddress)

  const tokenCall = governor.try_token()
  if (tokenCall.reverted) {
    return
  }

  const daoAddress = tokenCall.value
  const dao = DAO.load(daoAddress.toHexString())
  if (!dao) {
    return
  }

  dao.escrowDelegateAddress = escrowDelegate
  dao.save()
}

function handlePropdateAttestationRevoked(event: RevokedEvent): void {
  const update = ProposalUpdate.load(event.params.uid.toHexString())
  if (!update) {
    return
  }
  update.deleted = true
  update.save()
}

function handleEscrowDelegateAttestationRevoked(event: RevokedEvent): void {
  const data = getAttestation(event.address, event.params.uid)
  if (!data) {
    return
  }
  const escrowDelegate = decodeEscrowDelegate(data)
  if (!escrowDelegate) {
    return
  }
  const treasuryAddress = event.params.recipient
  const treasury = Treasury.bind(treasuryAddress)

  const ownerCall = treasury.try_owner()
  if (ownerCall.reverted) {
    return
  }
  const governorAddress = ownerCall.value
  const governor = Governor.bind(governorAddress)

  const tokenCall = governor.try_token()
  if (tokenCall.reverted) {
    return
  }

  const daoAddress = tokenCall.value
  const dao = DAO.load(daoAddress.toHexString())
  if (!dao) {
    return
  }

  dao.escrowDelegateAddress = null
  dao.save()
}

export function handleAttested(event: AttestedEvent): void {
  if (event.params.schema == ESCROW_DELEGATE_SCHEMA_UID) {
    handleEscrowDelegateAttestation(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestation(event)
  }
}

export function handleRevoked(event: RevokedEvent): void {
  if (event.params.schema == ESCROW_DELEGATE_SCHEMA_UID) {
    handleEscrowDelegateAttestationRevoked(event)
  } else if (event.params.schema == PROPDATE_SCHEMA_UID) {
    handlePropdateAttestationRevoked(event)
  }
}
