import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'

const MAX_I32 = BigInt.fromString('2147483647')

function safeOffsetToI32(value: ethereum.Value, totalLen: i32): i32 {
  const asBigInt = value.toBigInt()
  if (asBigInt < BigInt.fromI32(0)) return -1
  if (asBigInt > MAX_I32) return -1
  if (asBigInt > BigInt.fromI32(totalLen)) return -1
  return asBigInt.toI32()
}

function readUint256At(data: Bytes, offset: i32): BigInt | null {
  if (offset < 0 || offset + 32 > data.length) return null
  const decoded = ethereum.decode('(uint256)', changetype<Bytes>(data.subarray(offset)))
  if (!decoded) return null
  return decoded.toTuple()[0].toBigInt()
}

function parseAddressArrayAt(data: Bytes, offset: i32): Array<Address> | null {
  const lengthBI = readUint256At(data, offset)
  if (!lengthBI || lengthBI > MAX_I32) return null
  const length = lengthBI.toI32()
  let out: Address[] = []
  for (let i = 0; i < length; i++) {
    const itemOffset = offset + 32 + i * 32
    if (itemOffset + 32 > data.length) return null
    const item = ethereum.decode(
      '(address)',
      changetype<Bytes>(data.subarray(itemOffset))
    )
    if (!item) return null
    out.push(item.toTuple()[0].toAddress())
  }
  return out
}

function parseUintArrayAt(data: Bytes, offset: i32): Array<BigInt> | null {
  const lengthBI = readUint256At(data, offset)
  if (!lengthBI || lengthBI > MAX_I32) return null
  const length = lengthBI.toI32()
  let out: BigInt[] = []
  for (let i = 0; i < length; i++) {
    const itemOffset = offset + 32 + i * 32
    const item = readUint256At(data, itemOffset)
    if (!item) return null
    out.push(item)
  }
  return out
}

function parseBytesArrayAt(data: Bytes, offset: i32): Array<Bytes> | null {
  const lengthBI = readUint256At(data, offset)
  if (!lengthBI || lengthBI > MAX_I32) return null
  const length = lengthBI.toI32()
  let out: Bytes[] = []

  for (let i = 0; i < length; i++) {
    const ptrOffset = offset + 32 + i * 32
    const relPtrBI = readUint256At(data, ptrOffset)
    if (!relPtrBI || relPtrBI > MAX_I32) return null
    const relPtr = relPtrBI.toI32()
    const itemHead = offset + 32 + relPtr
    const itemLenBI = readUint256At(data, itemHead)
    if (!itemLenBI || itemLenBI > MAX_I32) return null
    const itemLen = itemLenBI.toI32()
    if (itemHead + 32 + itemLen > data.length) return null
    out.push(changetype<Bytes>(data.subarray(itemHead + 32, itemHead + 32 + itemLen)))
  }

  return out
}

export const PROPDATE_SCHEMA_UID = Bytes.fromHexString(
  '0x8bd0d42901ce3cd9898dbea6ae2fbf1e796ef0923e7cbb0a1cecac2e42d47cb3'
)

export const DAO_MULTISIG_SCHEMA_UID = Bytes.fromHexString(
  '0x1289c5f988998891af7416d83820c40ba1c6f5ba31467f2e611172334dc53a0e'
)

export const TREASURY_ASSET_PIN_SCHEMA_UID = Bytes.fromHexString(
  '0xc384fd4fdacb670667c07759423132a193053742b58d5a056b61d72ba1a09e26'
)

export const PROPOSAL_CANDIDATE_SCHEMA_UID = Bytes.fromHexString(
  '0xc3315fb5b910e904d24f56c5b37dd5a5d06392bb040ba8ad669a9f7b3bbe2e4f'
)

export const CANDIDATE_COMMENT_SCHEMA_UID = Bytes.fromHexString(
  '0x1decf999b02cbecd8697ae7cf0c4017bc0115adbee476da79634332fdff965b2'
)

export const CANDIDATE_SPONSOR_SIGNATURE_SCHEMA_UID = Bytes.fromHexString(
  '0x58cd8b0e3e1bd4c8c0d980826c3a041d315132ecccbfb7063f6458c05809e54a'
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

export class TreasuryAssetPin extends ethereum.Tuple {
  get tokenType(): i32 {
    return this[0].toI32()
  }
  get token(): Address {
    return this[1].toAddress()
  }
  get isCollection(): boolean {
    return this[2].toBoolean()
  }
  get tokenId(): BigInt {
    return this[3].toBigInt()
  }
}

// const TREASURY_ASSET_PIN_SCHEMA = `uint8 tokenType, address token, bool isCollection, uint256 tokenId`
export function decodeTreasuryAssetPin(data: Bytes): TreasuryAssetPin | null {
  const value = ethereum.decode('(uint8,address,bool,uint256)', data)
  if (!value) {
    return null
  }

  const tuple = value.toTuple()
  const tokenType = tuple[0].toI32()
  const token = tuple[1].toAddress()
  const isCollection = tuple[2].toBoolean()
  const tokenId = tuple[3].toBigInt()

  // Validate canonical rules
  // Rule 0: tokenType must be 0 (ERC20), 1 (ERC721), or 2 (ERC1155)
  if (tokenType < 0 || tokenType > 2) {
    return null
  }

  // Rule 1: token != address(0)
  if (token.toHexString() == '0x0000000000000000000000000000000000000000') {
    return null
  }

  // Rule 2: If tokenType == ERC20 (0), tokenId MUST be 0
  if (tokenType == 0 && tokenId != BigInt.fromI32(0)) {
    return null
  }

  // Rule 3: If tokenType == ERC721 (1) or ERC1155 (2), if isCollection == true, tokenId MUST be 0
  if (
    (tokenType == 1 || tokenType == 2) &&
    isCollection &&
    tokenId != BigInt.fromI32(0)
  ) {
    return null
  }

  const tupleVals: Array<ethereum.Value> = [
    ethereum.Value.fromI32(tokenType),
    ethereum.Value.fromAddress(token),
    ethereum.Value.fromBoolean(isCollection),
    ethereum.Value.fromUnsignedBigInt(tokenId),
  ]
  return changetype<TreasuryAssetPin>(tupleVals)
}

export class ProposalCandidate extends ethereum.Tuple {
  get candidateId(): Bytes {
    return this[0].toBytes()
  }
  get salt(): Bytes {
    return this[1].toBytes()
  }
  get targets(): Array<Address> {
    return this[2].toAddressArray()
  }
  get values(): Array<BigInt> {
    return this[3].toBigIntArray()
  }
  get calldatas(): Array<Bytes> {
    return this[4].toBytesArray()
  }
  get description(): string {
    return this[5].toString()
  }
}

export function decodeProposalCandidate(data: Bytes): ProposalCandidate | null {
  const head = ethereum.decode('(bytes32,bytes32,uint256,uint256,uint256,uint256)', data)
  if (!head) return null

  const headTuple = head.toTuple()
  const candidateId = headTuple[0].toBytes()
  const salt = headTuple[1].toBytes()
  const totalLen = data.length
  const targetsOffset = safeOffsetToI32(headTuple[2], totalLen)
  const valuesOffset = safeOffsetToI32(headTuple[3], totalLen)
  const calldatasOffset = safeOffsetToI32(headTuple[4], totalLen)
  const descriptionOffset = safeOffsetToI32(headTuple[5], totalLen)

  if (
    targetsOffset < 0 ||
    valuesOffset < 0 ||
    calldatasOffset < 0 ||
    descriptionOffset < 0 ||
    targetsOffset > totalLen ||
    valuesOffset > totalLen ||
    calldatasOffset > totalLen ||
    descriptionOffset > totalLen
  ) {
    return null
  }

  const targets = parseAddressArrayAt(data, targetsOffset)
  if (!targets) return null

  const values = parseUintArrayAt(data, valuesOffset)
  if (!values) return null

  const calldatas = parseBytesArrayAt(data, calldatasOffset)
  if (!calldatas) return null

  if (targets.length != values.length || targets.length != calldatas.length) return null

  if (descriptionOffset + 32 > totalLen) return null
  const descriptionHead = ethereum.decode(
    '(uint256)',
    changetype<Bytes>(data.subarray(descriptionOffset))
  )
  if (!descriptionHead) return null
  const descriptionLength = descriptionHead.toTuple()[0].toI32()
  if (descriptionLength < 0 || descriptionOffset + 32 + descriptionLength > totalLen) {
    return null
  }
  const description = changetype<Bytes>(
    data.subarray(descriptionOffset + 32, descriptionOffset + 32 + descriptionLength)
  ).toString()

  const tupleVals: Array<ethereum.Value> = [
    ethereum.Value.fromFixedBytes(candidateId),
    ethereum.Value.fromFixedBytes(salt),
    ethereum.Value.fromAddressArray(targets),
    ethereum.Value.fromUnsignedBigIntArray(values),
    ethereum.Value.fromBytesArray(calldatas),
    ethereum.Value.fromString(description),
  ]
  return changetype<ProposalCandidate>(tupleVals)
}

export class CandidateComment extends ethereum.Tuple {
  get candidateId(): Bytes {
    return this[0].toBytes()
  }
  get support(): i32 {
    return this[1].toI32()
  }
  get comment(): string {
    return this[2].toString()
  }
  get parentCommentUID(): Bytes {
    return this[3].toBytes()
  }
}

export function decodeCandidateComment(data: Bytes): CandidateComment | null {
  const head = ethereum.decode('(bytes32,uint256,uint256,bytes32)', data)
  if (!head) return null

  const headTuple = head.toTuple()
  const candidateId = headTuple[0].toBytes()
  const supportValue = headTuple[1].toBigInt()
  if (supportValue < BigInt.fromI32(0) || supportValue > BigInt.fromI32(3)) {
    return null
  }
  const support = supportValue.toI32()
  const commentOffset = safeOffsetToI32(headTuple[2], data.length)
  const parentCommentUID = headTuple[3].toBytes()

  const totalLen = data.length
  if (commentOffset < 0 || commentOffset + 32 > totalLen) {
    return null
  }

  const stringBytes = changetype<Bytes>(data.subarray(commentOffset))
  const stringHead = ethereum.decode('(uint256)', stringBytes)
  if (!stringHead) return null

  const stringLength = stringHead.toTuple()[0].toI32()
  if (stringLength < 0 || commentOffset + 32 + stringLength > totalLen) {
    return null
  }

  const commentBytes = changetype<Bytes>(
    data.subarray(commentOffset + 32, commentOffset + 32 + stringLength)
  )
  const comment = commentBytes.toString()

  const tupleVals: Array<ethereum.Value> = [
    ethereum.Value.fromFixedBytes(candidateId),
    ethereum.Value.fromI32(support),
    ethereum.Value.fromString(comment),
    ethereum.Value.fromFixedBytes(parentCommentUID),
  ]
  return changetype<CandidateComment>(tupleVals)
}

export class CandidateSponsorSignature extends ethereum.Tuple {
  get candidateId(): Bytes {
    return this[0].toBytes()
  }
  get proposalId(): Bytes {
    return this[1].toBytes()
  }
  get nonce(): BigInt {
    return this[2].toBigInt()
  }
  get deadline(): BigInt {
    return this[3].toBigInt()
  }
  get signature(): Bytes {
    return this[4].toBytes()
  }
}

export function decodeCandidateSponsorSignature(
  data: Bytes
): CandidateSponsorSignature | null {
  const head = ethereum.decode('(bytes32,bytes32,uint256,uint256,uint256)', data)
  if (!head) return null

  const headTuple = head.toTuple()
  const candidateId = headTuple[0].toBytes()
  const proposalId = headTuple[1].toBytes()
  const nonce = headTuple[2].toBigInt()
  const deadline = headTuple[3].toBigInt()
  const signatureOffset = safeOffsetToI32(headTuple[4], data.length)

  const totalLen = data.length
  if (signatureOffset < 0 || signatureOffset + 32 > totalLen) {
    return null
  }

  const signatureSlice = changetype<Bytes>(data.subarray(signatureOffset))
  const signatureHead = ethereum.decode('(uint256)', signatureSlice)
  if (!signatureHead) return null

  const signatureLength = signatureHead.toTuple()[0].toI32()
  if (signatureLength < 0 || signatureOffset + 32 + signatureLength > totalLen) {
    return null
  }

  const signature = changetype<Bytes>(
    data.subarray(signatureOffset + 32, signatureOffset + 32 + signatureLength)
  )

  const tupleVals: Array<ethereum.Value> = [
    ethereum.Value.fromFixedBytes(candidateId),
    ethereum.Value.fromFixedBytes(proposalId),
    ethereum.Value.fromUnsignedBigInt(nonce),
    ethereum.Value.fromUnsignedBigInt(deadline),
    ethereum.Value.fromBytes(signature),
  ]

  return changetype<CandidateSponsorSignature>(tupleVals)
}
