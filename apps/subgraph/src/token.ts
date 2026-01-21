import { Address, ethereum, store } from '@graphprotocol/graph-ts'
import { DAO, DAOTokenOwner, DAOVoter, Snapshot, Token } from '../generated/schema'
import {
  DelegateChanged as DelegateChangedEvent,
  Token as TokenContract,
  Transfer as TransferEvent,
} from '../generated/templates/Token/Token'
import { setTokenMetadata } from './utils/setTokenMetadata'

const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

function daoId(event: ethereum.Event): string {
  return event.address.toHexString()
}

function ownerEntityId(dao: string, owner: Address): string {
  return `${dao}:${owner.toHexString()}`
}

function voterEntityId(dao: string, voter: Address): string {
  return `${dao}:${voter.toHexString()}`
}

function ensureOwner(dao: DAO, daoAddr: string, owner: Address): DAOTokenOwner | null {
  if (owner.equals(ADDRESS_ZERO)) return null

  let id = ownerEntityId(daoAddr, owner)
  let ent = DAOTokenOwner.load(id)
  if (!ent) {
    ent = new DAOTokenOwner(id)
    ent.dao = daoAddr
    ent.owner = owner
    ent.delegate = ADDRESS_ZERO
    ent.daoTokenCount = 0
    ent.save()
    dao.ownerCount += 1
  }
  return ent
}

function ensureVoter(dao: DAO, daoAddr: string, voter: Address): DAOVoter | null {
  if (voter.equals(ADDRESS_ZERO)) return null

  let id = voterEntityId(daoAddr, voter)
  let ent = DAOVoter.load(id)
  if (!ent) {
    ent = new DAOVoter(id)
    ent.dao = daoAddr
    ent.voter = voter
    ent.daoTokenCount = 0
    ent.save()
    dao.voterCount += 1
  }
  return ent
}

function recomputeOwnerCount(dao: DAO, ownerId: string): void {
  let o = DAOTokenOwner.load(ownerId)
  if (!o) return

  let n = o.daoTokens.load().length
  if (n == 0) {
    store.remove('DAOTokenOwner', ownerId)
    if (dao.ownerCount > 0) dao.ownerCount -= 1
    return
  }

  o.daoTokenCount = n
  o.save()
}

function recomputeVoterCount(dao: DAO, voterId: string): void {
  let v = DAOVoter.load(voterId)
  if (!v) return

  let n = v.daoTokens.load().length
  if (n == 0) {
    store.remove('DAOVoter', voterId)
    if (dao.voterCount > 0) dao.voterCount -= 1
    return
  }

  v.daoTokenCount = n
  v.save()
}

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  let daoAddr = daoId(event)
  let dao = DAO.load(daoAddr)
  if (!dao) return

  let delegator = event.params.delegator
  let prevDelegate = event.params.from
  let newDelegate = event.params.to

  // Ensure owner exists
  let ownerEnt = ensureOwner(dao, daoAddr, delegator)
  if (!ownerEnt) return

  // Persist current delegate on owner
  ownerEnt.delegate = newDelegate
  ownerEnt.save()

  // Ensure involved voters exist (non-zero)
  ensureVoter(dao, daoAddr, prevDelegate)
  ensureVoter(dao, daoAddr, newDelegate)

  // Move all owned tokens' voterInfo to the new delegate voter-id
  let newVoterId = voterEntityId(daoAddr, newDelegate)
  let ownedTokens = ownerEnt.daoTokens.load()
  for (let i = 0; i < ownedTokens.length; i++) {
    let t = ownedTokens[i]
    t.voterInfo = newVoterId
    t.save()
  }

  // Recompute counts from derived relations (authoritative)
  recomputeOwnerCount(dao, ownerEnt.id)
  recomputeVoterCount(dao, voterEntityId(daoAddr, prevDelegate))
  recomputeVoterCount(dao, newVoterId)

  dao.save()
  saveSnapshot(event)
}

export function handleTransfer(event: TransferEvent): void {
  let daoAddr = daoId(event)
  let dao = DAO.load(daoAddr)
  if (!dao) return

  let tokenContract = TokenContract.bind(event.address)

  let tokenEntityId = `${daoAddr}:${event.params.tokenId.toString()}`
  let token = Token.load(tokenEntityId)

  // First-seen token init (mint path)
  if (!token) {
    token = new Token(tokenEntityId)

    let tokenURI = tokenContract.try_tokenURI(event.params.tokenId)
    token.name = `${tokenContract.name()} #${event.params.tokenId.toString()}`
    if (!tokenURI.reverted) setTokenMetadata(token, tokenURI.value)

    token.tokenContract = event.address
    token.tokenId = event.params.tokenId
    token.mintedAt = event.block.timestamp
    token.dao = daoAddr

    dao.totalSupply += 1
    dao.tokensCount += 1
  }

  // Always set owner + ownerInfo (non-null relationship)
  token.owner = event.params.to
  token.ownerInfo = ownerEntityId(daoAddr, event.params.to)

  // Burn: must still set voterInfo (non-null), but do NOT call delegates(0x0)
  if (event.params.to.equals(ADDRESS_ZERO)) {
    token.voterInfo = voterEntityId(daoAddr, ADDRESS_ZERO)
    token.save()

    dao.totalSupply -= 1

    // Recompute "from" side since token left them
    if (!event.params.from.equals(ADDRESS_ZERO)) {
      ensureOwner(dao, daoAddr, event.params.from)

      let fromDelegate = tokenContract.delegates(event.params.from)
      ensureVoter(dao, daoAddr, fromDelegate)

      recomputeOwnerCount(dao, ownerEntityId(daoAddr, event.params.from))
      recomputeVoterCount(dao, voterEntityId(daoAddr, fromDelegate))
    }

    dao.save()
    saveSnapshot(event)
    return
  }

  // Normal transfer/mint: link voterInfo to recipient's delegate (your contract emits prevDelegate correctly)
  let toDelegate = tokenContract.delegates(event.params.to)
  token.voterInfo = voterEntityId(daoAddr, toDelegate)
  token.save()

  // Ensure entities exist (non-zero)
  ensureOwner(dao, daoAddr, event.params.to)
  ensureVoter(dao, daoAddr, toDelegate)

  if (!event.params.from.equals(ADDRESS_ZERO)) {
    ensureOwner(dao, daoAddr, event.params.from)

    let fromDelegate = tokenContract.delegates(event.params.from)
    ensureVoter(dao, daoAddr, fromDelegate)

    recomputeOwnerCount(dao, ownerEntityId(daoAddr, event.params.from))
    recomputeVoterCount(dao, voterEntityId(daoAddr, fromDelegate))
  }

  recomputeOwnerCount(dao, ownerEntityId(daoAddr, event.params.to))
  recomputeVoterCount(dao, voterEntityId(daoAddr, toDelegate))

  dao.save()
  saveSnapshot(event)
}

function saveSnapshot(event: ethereum.Event): void {
  let snapshotId = `${event.address.toHexString()}:${event.block.number.toString()}`
  let snapshot = Snapshot.load(snapshotId)
  if (!snapshot) {
    snapshot = new Snapshot(snapshotId)
    snapshot.dao = event.address.toHexString()
    snapshot.blockNumber = event.block.number
    snapshot.timestamp = event.block.timestamp
  }

  let dao = DAO.load(event.address.toHexString())
  if (!dao) return

  snapshot.totalSupply = dao.totalSupply
  snapshot.ownerCount = dao.ownerCount
  snapshot.voterCount = dao.voterCount
  snapshot.proposalCount = dao.proposalCount
  snapshot.tokensCount = dao.tokensCount
  snapshot.save()
}
