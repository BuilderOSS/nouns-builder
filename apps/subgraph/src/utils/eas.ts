import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts'

export const PROPDATE_SCHEMA_UID = Bytes.fromHexString(
  '0x8bd0d42901ce3cd9898dbea6ae2fbf1e796ef0923e7cbb0a1cecac2e42d47cb3'
)

export const ESCROW_DELEGATE_SCHEMA_UID = Bytes.fromHexString(
  '0x1289c5f988998891af7416d83820c40ba1c6f5ba31467f2e611172334dc53a0e'
)

export class Propdate extends ethereum.Tuple {
  get proposalId(): Bytes {
    return this[0].toBytes()
  }
  get originalMessageId(): Bytes {
    return this[1].toBytes()
  }
  get messageType(): i32 {
    return this[2].toI32()
  }
  get message(): string {
    return this[3].toString()
  }
}

// const PROPDATE_SCHEMA = 'bytes32 proposalId, bytes32 originalMessageId, uint8 messageType, string message'
export function decodePropdate(data: Bytes): Propdate | null {
  const value = ethereum.decode('(bytes32,bytes32,uint8,string)', data)
  if (!value) {
    return null
  }
  return changetype<Propdate>(value.toTuple())
}

// const ESCROW_DELEGATE_SCHEMA = `address daoMultiSig`
export function decodeEscrowDelegate(data: Bytes): Address | null {
  const value = ethereum.decode('(address)', data)
  if (!value) {
    return null
  }
  return value.toTuple()[0].toAddress()
}
