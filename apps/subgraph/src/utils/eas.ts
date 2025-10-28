import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts'

export const PROPDATE_SCHEMA_UID = Bytes.fromHexString(
  '0x8bd0d42901ce3cd9898dbea6ae2fbf1e796ef0923e7cbb0a1cecac2e42d47cb3'
)

export const DAO_MULTISIG_SCHEMA_UID = Bytes.fromHexString(
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
  // --- decode static portion only ---
  const head = ethereum.decode('(bytes32,bytes32,uint8,uint256)', data)
  if (head == null) return null

  const headTuple = head.toTuple()
  const proposalId = headTuple[0].toBytes()
  const originalMessageId = headTuple[1].toBytes()
  const messageType = headTuple[2].toI32()
  const messageOffset = headTuple[3].toI32()

  // --- validate offsets to avoid OOB ---
  const totalLen = data.length
  // offset must be non‑negative and leave room for the string length word
  if (messageOffset < 0 || messageOffset + 32 > totalLen) {
    return null
  }

  // --- manually parse string tail ---
  const stringBytes = changetype<Bytes>(data.subarray(messageOffset))
  const stringHead = ethereum.decode('(uint256)', stringBytes)
  if (stringHead == null) return null

  const stringLength = stringHead.toTuple()[0].toI32()
  // length must be non‑negative and within bounds
  if (stringLength < 0 || messageOffset + 32 + stringLength > totalLen) {
    return null
  }

  const msgBytes = changetype<Bytes>(
    data.subarray(messageOffset + 32, messageOffset + 32 + stringLength)
  )
  const message = msgBytes.toString() // AssemblyScript Bytes → string

  // --- rebuild Propdate tuple ---
  const tupleVals: Array<ethereum.Value> = [
    ethereum.Value.fromFixedBytes(proposalId),
    ethereum.Value.fromFixedBytes(originalMessageId),
    ethereum.Value.fromI32(messageType),
    ethereum.Value.fromString(message),
  ]
  return changetype<Propdate>(tupleVals)
}

// const DAO_MULTISIG_SCHEMA = `address daoMultiSig`
export function decodeDaoMultisig(data: Bytes): Address | null {
  const value = ethereum.decode('(address)', data)
  if (!value) {
    return null
  }
  return value.toTuple()[0].toAddress()
}
