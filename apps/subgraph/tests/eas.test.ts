import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  assert,
  clearStore,
  createMockedFunction,
  describe,
  newTypedMockEvent,
  test,
} from 'matchstick-as'

import { Attested, Revoked } from '../generated/EAS/EAS'
import { ProfileLinkOverride } from '../generated/schema'
import { handleAttested, handleRevoked } from '../src/eas'
import {
  decodeCandidateComment,
  decodeCandidateSponsorSignature,
  decodeDaoMultisig,
  decodeProfileLink,
  decodePropdate,
  PROFILE_LINK_SCHEMA_UID,
} from '../src/utils/eas'

const PROFILE_EAS_ADDRESS = '0x00000000000000000000000000000000000000cc'
const PROFILE_ADDRESS = '0x00000000000000000000000000000000000000dd'
const PROFILE_LINK_UID =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

function encodeProfileLink(key: string, value: string): Bytes {
  const tuple = new ethereum.Tuple()
  tuple.push(ethereum.Value.fromString(key))
  tuple.push(ethereum.Value.fromString(value))
  return changetype<Bytes>(ethereum.encode(ethereum.Value.fromTuple(tuple)))
}

function mockProfileLinkAttestation(data: Bytes): void {
  const attestation = new ethereum.Tuple()
  attestation.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(PROFILE_LINK_UID)))
  attestation.push(ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID))
  attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)))
  attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  attestation.push(
    ethereum.Value.fromFixedBytes(
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
    )
  )
  attestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
  attestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
  attestation.push(ethereum.Value.fromBoolean(true))
  attestation.push(ethereum.Value.fromBytes(data))

  createMockedFunction(
    Address.fromString(PROFILE_EAS_ADDRESS),
    'getAttestation',
    'getAttestation(bytes32):((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))'
  )
    .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString(PROFILE_LINK_UID))])
    .returns([ethereum.Value.fromTuple(attestation)])
}

function createProfileLinkAttestedEvent(): Attested {
  const event = newTypedMockEvent<Attested>()
  event.address = Address.fromString(PROFILE_EAS_ADDRESS)
  event.parameters = [
    new ethereum.EventParam(
      'recipient',
      ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
    ),
    new ethereum.EventParam(
      'attester',
      ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
    ),
    new ethereum.EventParam(
      'uid',
      ethereum.Value.fromFixedBytes(Bytes.fromHexString(PROFILE_LINK_UID))
    ),
    new ethereum.EventParam(
      'schema',
      ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID)
    ),
  ]
  return event
}

function createProfileLinkRevokedEvent(): Revoked {
  const event = newTypedMockEvent<Revoked>()
  event.address = Address.fromString(PROFILE_EAS_ADDRESS)
  event.parameters = [
    new ethereum.EventParam(
      'recipient',
      ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
    ),
    new ethereum.EventParam(
      'attester',
      ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
    ),
    new ethereum.EventParam(
      'uid',
      ethereum.Value.fromFixedBytes(Bytes.fromHexString(PROFILE_LINK_UID))
    ),
    new ethereum.EventParam(
      'schema',
      ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID)
    ),
  ]
  return event
}

describe('Profile link indexing', () => {
  test('indexes a self-attested profile link without a DAO entity', () => {
    clearStore()
    mockProfileLinkAttestation(encodeProfileLink('website', 'https://example.com'))

    handleAttested(createProfileLinkAttestedEvent())

    const compositeId = PROFILE_ADDRESS + '-website'
    const override = ProfileLinkOverride.load(compositeId)
    assert.assertNotNull(override)
    if (!override) return

    assert.bytesEquals(override.profile, Address.fromString(PROFILE_ADDRESS))
    assert.stringEquals(override.key, 'website')
    assert.stringEquals(override.value, 'https://example.com')
    assert.bytesEquals(override.attestationUID, Bytes.fromHexString(PROFILE_LINK_UID))
    assert.assertFalse(override.revoked)
  })

  test('revokes a self-attested profile link without a DAO entity', () => {
    clearStore()
    mockProfileLinkAttestation(encodeProfileLink('x', 'buildeross'))
    handleAttested(createProfileLinkAttestedEvent())

    handleRevoked(createProfileLinkRevokedEvent())

    const compositeId = PROFILE_ADDRESS + '-x'
    const override = ProfileLinkOverride.load(compositeId)
    assert.assertNotNull(override)
    if (!override) return

    assert.assertTrue(override.revoked)
    assert.bytesEquals(override.revokedBy as Bytes, Address.fromString(PROFILE_ADDRESS))
  })

  test('replaces existing profile link with same key', () => {
    clearStore()

    // First attestation
    mockProfileLinkAttestation(encodeProfileLink('website', 'https://old.com'))
    handleAttested(createProfileLinkAttestedEvent())

    // Second attestation with same key but different UID and value
    const newUid = '0x2222222222222222222222222222222222222222222222222222222222222222'
    const newData = encodeProfileLink('website', 'https://new.com')

    const attestation = new ethereum.Tuple()
    attestation.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(newUid)))
    attestation.push(ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID))
    attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)))
    attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    attestation.push(
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
      )
    )
    attestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
    attestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
    attestation.push(ethereum.Value.fromBoolean(true))
    attestation.push(ethereum.Value.fromBytes(newData))

    createMockedFunction(
      Address.fromString(PROFILE_EAS_ADDRESS),
      'getAttestation',
      'getAttestation(bytes32):((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))'
    )
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString(newUid))])
      .returns([ethereum.Value.fromTuple(attestation)])

    const newEvent = newTypedMockEvent<Attested>()
    newEvent.address = Address.fromString(PROFILE_EAS_ADDRESS)
    newEvent.block.timestamp = BigInt.fromI32(2)
    newEvent.parameters = [
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam(
        'attester',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam('uid', ethereum.Value.fromFixedBytes(Bytes.fromHexString(newUid))),
      new ethereum.EventParam(
        'schema',
        ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID)
      ),
    ]

    handleAttested(newEvent)

    // Should have only one entry with composite ID, containing new value
    const compositeId = PROFILE_ADDRESS + '-website'
    const override = ProfileLinkOverride.load(compositeId)
    assert.assertNotNull(override)
    if (!override) return

    assert.stringEquals(override.value, 'https://new.com')
    assert.bytesEquals(override.attestationUID, Bytes.fromHexString(newUid))
  })

  test('deletes profile link when empty value is attested', () => {
    clearStore()

    // First create a link
    mockProfileLinkAttestation(encodeProfileLink('website', 'https://example.com'))
    handleAttested(createProfileLinkAttestedEvent())

    const compositeId = PROFILE_ADDRESS + '-website'
    assert.assertNotNull(ProfileLinkOverride.load(compositeId))

    // Now attest empty value to remove it
    const emptyUid = '0x3333333333333333333333333333333333333333333333333333333333333333'
    const emptyData = encodeProfileLink('website', '')

    const attestation = new ethereum.Tuple()
    attestation.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(emptyUid)))
    attestation.push(ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID))
    attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)))
    attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    attestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    attestation.push(
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
      )
    )
    attestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
    attestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
    attestation.push(ethereum.Value.fromBoolean(true))
    attestation.push(ethereum.Value.fromBytes(emptyData))

    createMockedFunction(
      Address.fromString(PROFILE_EAS_ADDRESS),
      'getAttestation',
      'getAttestation(bytes32):((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))'
    )
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString(emptyUid))])
      .returns([ethereum.Value.fromTuple(attestation)])

    const emptyEvent = newTypedMockEvent<Attested>()
    emptyEvent.address = Address.fromString(PROFILE_EAS_ADDRESS)
    emptyEvent.block.timestamp = BigInt.fromI32(2)
    emptyEvent.parameters = [
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam(
        'attester',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam('uid', ethereum.Value.fromFixedBytes(Bytes.fromHexString(emptyUid))),
      new ethereum.EventParam(
        'schema',
        ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID)
      ),
    ]

    handleAttested(emptyEvent)

    // Entity should be deleted
    assert.assertNull(ProfileLinkOverride.load(compositeId))
  })

  test('ignores non-self-attested profile links', () => {
    clearStore()

    const otherAttester = '0x0000000000000000000000000000000000000099'
    mockProfileLinkAttestation(encodeProfileLink('website', 'https://malicious.com'))

    const event = newTypedMockEvent<Attested>()
    event.address = Address.fromString(PROFILE_EAS_ADDRESS)
    event.parameters = [
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam(
        'attester',
        ethereum.Value.fromAddress(Address.fromString(otherAttester))
      ),
      new ethereum.EventParam(
        'uid',
        ethereum.Value.fromFixedBytes(Bytes.fromHexString(PROFILE_LINK_UID))
      ),
      new ethereum.EventParam(
        'schema',
        ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID)
      ),
    ]

    handleAttested(event)

    // Should not create entity
    const compositeId = PROFILE_ADDRESS + '-website'
    assert.assertNull(ProfileLinkOverride.load(compositeId))
  })

  test('ignores revocation of old attestation that is not current', () => {
    clearStore()

    // Create first attestation
    mockProfileLinkAttestation(encodeProfileLink('website', 'https://old.com'))
    handleAttested(createProfileLinkAttestedEvent())

    // Replace with new attestation
    const newUid = '0x2222222222222222222222222222222222222222222222222222222222222222'
    const newData = encodeProfileLink('website', 'https://new.com')

    const newAttestation = new ethereum.Tuple()
    newAttestation.push(ethereum.Value.fromFixedBytes(Bytes.fromHexString(newUid)))
    newAttestation.push(ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID))
    newAttestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)))
    newAttestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    newAttestation.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
    newAttestation.push(
      ethereum.Value.fromFixedBytes(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000000000'
        )
      )
    )
    newAttestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
    newAttestation.push(ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS)))
    newAttestation.push(ethereum.Value.fromBoolean(true))
    newAttestation.push(ethereum.Value.fromBytes(newData))

    createMockedFunction(
      Address.fromString(PROFILE_EAS_ADDRESS),
      'getAttestation',
      'getAttestation(bytes32):((bytes32,bytes32,uint64,uint64,uint64,bytes32,address,address,bool,bytes))'
    )
      .withArgs([ethereum.Value.fromFixedBytes(Bytes.fromHexString(newUid))])
      .returns([ethereum.Value.fromTuple(newAttestation)])

    const newEvent = newTypedMockEvent<Attested>()
    newEvent.address = Address.fromString(PROFILE_EAS_ADDRESS)
    newEvent.block.timestamp = BigInt.fromI32(2)
    newEvent.parameters = [
      new ethereum.EventParam(
        'recipient',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam(
        'attester',
        ethereum.Value.fromAddress(Address.fromString(PROFILE_ADDRESS))
      ),
      new ethereum.EventParam('uid', ethereum.Value.fromFixedBytes(Bytes.fromHexString(newUid))),
      new ethereum.EventParam(
        'schema',
        ethereum.Value.fromFixedBytes(PROFILE_LINK_SCHEMA_UID)
      ),
    ]
    handleAttested(newEvent)

    // Now try to revoke the OLD attestation
    const revokeEvent = createProfileLinkRevokedEvent()
    handleRevoked(revokeEvent)

    // Should still be active (not revoked) because we revoked old UID
    const compositeId = PROFILE_ADDRESS + '-website'
    const override = ProfileLinkOverride.load(compositeId)
    assert.assertNotNull(override)
    if (!override) return

    assert.assertFalse(override.revoked)
    assert.stringEquals(override.value, 'https://new.com')
  })

  test('supports any arbitrary key without validation', () => {
    clearStore()

    const customKey = 'customPlatform123'
    mockProfileLinkAttestation(encodeProfileLink(customKey, 'https://custom.com'))
    handleAttested(createProfileLinkAttestedEvent())

    const compositeId = PROFILE_ADDRESS + '-' + customKey
    const override = ProfileLinkOverride.load(compositeId)
    assert.assertNotNull(override)
    if (!override) return

    assert.stringEquals(override.key, customKey)
    assert.stringEquals(override.value, 'https://custom.com')
  })
})

describe('Eas Decode Tests', () => {
  test('decode propdate test - message type 0', () => {
    const data = Bytes.fromHexString(
      '0xe7fff6cfea00f81bb8368238284edf85c1a87fe9ce660868061f6625f5aa0efb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000165468697320697320747970652030206d65737361676500000000000000000000'
    )
    const decoded = decodePropdate(data)
    assert.assertNotNull(decoded)

    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }

    assert.bytesEquals(
      decoded.proposalId,
      Bytes.fromHexString(
        '0xe7fff6cfea00f81bb8368238284edf85c1a87fe9ce660868061f6625f5aa0efb'
      )
    )

    assert.bytesEquals(
      decoded.originalMessageId,
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
    )

    assert.i32Equals(decoded.messageType, 0)

    assert.stringEquals('This is type 0 message', decoded.message)
  })

  test('decode propdate test - message type 1', () => {
    const data = Bytes.fromHexString(
      '0xe7fff6cfea00f81bb8368238284edf85c1a87fe9ce660868061f6625f5aa0efb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000247b22636f6e74656e74223a225468697320697320747970652031206d657373616765227d00000000000000000000000000000000000000000000000000000000'
    )
    const decoded = decodePropdate(data)
    assert.assertNotNull(decoded)

    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }

    assert.bytesEquals(
      decoded.proposalId,
      Bytes.fromHexString(
        '0xe7fff6cfea00f81bb8368238284edf85c1a87fe9ce660868061f6625f5aa0efb'
      )
    )

    assert.bytesEquals(
      decoded.originalMessageId,
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
    )

    assert.i32Equals(decoded.messageType, 1)

    assert.stringEquals(decoded.message, '{"content":"This is type 1 message"}')
  })

  test('decode propdate test - message type 1 with milestoneId', () => {
    const data = Bytes.fromHexString(
      '0xc11df14d57afe8f0398ce34cff647198688938a5b705b580e7a0d1553028815500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000467b22636f6e74656e74223a225468697320697320747970652031206d6573736167652077697468206d696c6573746f6e65206964222c226d696c6573746f6e654964223a307d0000000000000000000000000000000000000000000000000000'
    )
    const decoded = decodePropdate(data)
    assert.assertNotNull(decoded)

    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }

    assert.bytesEquals(
      decoded.proposalId,
      Bytes.fromHexString(
        '0xc11df14d57afe8f0398ce34cff647198688938a5b705b580e7a0d15530288155'
      )
    )

    assert.bytesEquals(
      decoded.originalMessageId,
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
    )

    assert.i32Equals(decoded.messageType, 1)

    assert.stringEquals(
      decoded.message,
      '{"content":"This is type 1 message with milestone id","milestoneId":0}'
    )
  })

  test('decode propdate test - message type 2', () => {
    const data = Bytes.fromHexString(
      '0xc11df14d57afe8f0398ce34cff647198688938a5b705b580e7a0d155302881550000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000042697066733a2f2f6261666b72656966617962746166366670636c656f6274346f6f696a3266337534726468676c323333737374336532717072773377376c6f707934000000000000000000000000000000000000000000000000000000000000'
    )
    const decoded = decodePropdate(data)
    assert.assertNotNull(decoded)

    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }

    assert.bytesEquals(
      decoded.proposalId,
      Bytes.fromHexString(
        '0xc11df14d57afe8f0398ce34cff647198688938a5b705b580e7a0d15530288155'
      )
    )

    assert.bytesEquals(
      decoded.originalMessageId,
      Bytes.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
    )

    assert.i32Equals(decoded.messageType, 2)

    assert.stringEquals(
      decoded.message,
      'ipfs://bafkreifaybtaf6fpcleobt4ooij2f3u4rdhgl233sst3e2qprw3w7lopy4'
    )
  })

  test('decode escrow delegate', () => {
    const data = Bytes.fromHexString(
      '0x00000000000000000000000019a8eb80c1483ceaa1278b16c5d5ef0104f85905'
    )
    const decoded = decodeDaoMultisig(data)
    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }
    assert.addressEquals(
      decoded,
      Address.fromString('0x19a8eb80c1483ceaa1278b16c5d5ef0104f85905')
    )
  })

  test('decode profile link', () => {
    const data = Bytes.fromHexString(
      '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000077765627369746500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001768747470733a2f2f6275696c6465726f73732e636f6d2f000000000000000000'
    )
    const decoded = decodeProfileLink(data)
    assert.assertNotNull(decoded)

    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }

    assert.stringEquals(decoded.key, 'website')
    assert.stringEquals(decoded.value, 'https://buildeross.com/')
  })

  test('decode candidate comment', () => {
    const data = Bytes.fromHexString(
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
    )
    const decoded = decodeCandidateComment(data)
    assert.assertNotNull(decoded)
    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }
    assert.i32Equals(decoded.support, 1)
    assert.stringEquals(decoded.comment, 'hello')
  })

  test('decode candidate sponsor signature', () => {
    // New schema: (bytes32 candidateId, bytes32 proposalId, uint256 nonce, uint256 deadline, bytes signature)
    const data = Bytes.fromHexString(
      '0x' +
        '1111111111111111111111111111111111111111111111111111111111111111' + // candidateId
        'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd' + // proposalId
        '0000000000000000000000000000000000000000000000000000000000000005' + // nonce = 5
        '00000000000000000000000000000000000000000000000000000000000f423f' + // deadline = 999999
        '00000000000000000000000000000000000000000000000000000000000000a0' + // offset to signature (160 bytes)
        '0000000000000000000000000000000000000000000000000000000000000002' + // signature length = 2
        'abcd000000000000000000000000000000000000000000000000000000000000' // signature = 0xabcd
    )
    const decoded = decodeCandidateSponsorSignature(data)
    assert.assertNotNull(decoded)
    if (!decoded) {
      assert.assertTrue(false, 'decoded should not be null')
      return
    }
    assert.bytesEquals(
      decoded.candidateId,
      Bytes.fromHexString(
        '0x1111111111111111111111111111111111111111111111111111111111111111'
      )
    )
    assert.bytesEquals(
      decoded.proposalId,
      Bytes.fromHexString(
        '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
      )
    )
    assert.i32Equals(decoded.nonce.toI32(), 5)
    assert.i32Equals(decoded.deadline.toI32(), 999999)
    assert.bytesEquals(decoded.signature, Bytes.fromHexString('0xabcd'))
  })
})
