import { DAO, DAOTokenOwner, Token } from '../generated/schema'
import { Transfer as TransferEvent, DelegateChanged as DelegateChangedEvent } from '../generated/templates/Token/Token'
import { Token as TokenContract } from '../generated/templates/Token/Token'
import { setTokenMetadata } from './utils/setTokenMetadata'
import { Bytes } from '@graphprotocol/graph-ts'
import { store } from '@graphprotocol/graph-ts'

let ADDRESS_ZERO = Bytes.fromHexString('0x0000000000000000000000000000000000000000')

export function handleDelegateChanged(event: DelegateChangedEvent): void {
  let tokenOwnerId = `${event.address.toHexString()}:${event.params.delegator.toHexString()}`

  let tokenOwner = DAOTokenOwner.load(tokenOwnerId)
  if (!tokenOwner) {
    tokenOwner = new DAOTokenOwner(tokenOwnerId)
    tokenOwner.daoTokenCount = 0
    tokenOwner.dao = event.address.toHexString()
    tokenOwner.owner = event.params.delegator
  }

  tokenOwner.delegate = event.params.to
  tokenOwner.save()
}

export function handleTransfer(event: TransferEvent): void {
  let tokenId = `${event.address.toHexString()}:${event.params.tokenId.toString()}`
  let token = Token.load(tokenId)
  let dao = DAO.load(event.address.toHexString())!

  let tokenContract = TokenContract.bind(event.address)
  let fromDelegate = tokenContract.delegates(event.params.from)
  let toDelegate = tokenContract.delegates(event.params.to)

  // Handle loading token data on first transfer
  if (!token) {

    token = new Token(tokenId)

    let tokenURI = tokenContract.try_tokenURI(event.params.tokenId)

    token.name = `${tokenContract.name()} #${event.params.tokenId.toString()}`
    if (!tokenURI.reverted) setTokenMetadata(token, tokenURI.value)

    token.tokenContract = event.address
    token.tokenId = event.params.tokenId
    token.mintedAt = event.block.timestamp
    token.dao = event.address.toHexString()

    dao.totalSupply = dao.totalSupply + 1
  }

  token.owner = event.params.to
  token.ownerInfo = `${event.address.toHexString()}:${event.params.to.toHexString()}`

  token.save()

  // Handle loading to owner
  if (event.params.to.notEqual(ADDRESS_ZERO)) {
    let toOwnerId = `${event.address.toHexString()}:${event.params.to.toHexString()}`
    let toOwner = DAOTokenOwner.load(toOwnerId)
    if (!toOwner) {
      toOwner = new DAOTokenOwner(toOwnerId)
      toOwner.daoTokenCount = 1
      toOwner.dao = event.address.toHexString()
      toOwner.owner = event.params.to
      dao.ownerCount = dao.ownerCount + 1
    } else toOwner.daoTokenCount = toOwner.daoTokenCount + 1

    toOwner.delegate = toDelegate
    toOwner.save()
  } else {
    // Handle burning
    dao.totalSupply = dao.totalSupply - 1
  }

  // Handle loading from owner
  if (event.params.from.notEqual(ADDRESS_ZERO)) {
    let fromOwnerId = `${event.address.toHexString()}:${event.params.from.toHexString()}`
    let fromOwner = DAOTokenOwner.load(fromOwnerId)!
    if (fromOwner.daoTokenCount === 1) {
      store.remove('DAOTokenOwner', fromOwnerId)
      dao.ownerCount = dao.ownerCount - 1
    } else {
      fromOwner.daoTokenCount = fromOwner.daoTokenCount - 1
      fromOwner.delegate = fromDelegate
      fromOwner.save()
    }
  }

  dao.save()
}
