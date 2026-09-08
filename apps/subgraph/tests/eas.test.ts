import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, describe, test } from 'matchstick-as'

import { ProfileLinkOverride } from '../generated/schema'
import {
  decodeCandidateComment,
  decodeCandidateSponsorSignature,
  decodeDaoMultisig,
  decodeProfileLink,
  decodePropdate,
} from '../src/utils/eas'

const PROFILE_ADDRESS = '0x00000000000000000000000000000000000000dd'
const PROFILE_LINK_UID =
  '0x1111111111111111111111111111111111111111111111111111111111111111'

describe('Profile link entity tests', () => {
  test('creates ProfileLinkOverride entity with correct fields', () => {
    clearStore()

    // Manually create a ProfileLinkOverride to test entity structure
    const override = new ProfileLinkOverride(PROFILE_ADDRESS + '-website')
    override.profile = Address.fromString(PROFILE_ADDRESS)
    override.key = 'website'
    override.value = 'https://example.com'
    override.attestationUID = Bytes.fromHexString(PROFILE_LINK_UID)
    override.transactionHash = Bytes.fromHexString(
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    )
    override.timestamp = BigInt.fromI32(1)
    override.creator = Address.fromString(PROFILE_ADDRESS)
    override.revoked = false
    override.revokedAt = null
    override.revokedBy = null
    override.revokedTxHash = null
    override.save()

    // Verify entity was created with correct fields
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-website',
      'key',
      'website'
    )
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-website',
      'value',
      'https://example.com'
    )
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-website',
      'revoked',
      'false'
    )
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-website',
      'profile',
      PROFILE_ADDRESS
    )
  })

  test('handles ProfileLinkOverride updates correctly', () => {
    clearStore()

    // Create initial override
    const override = new ProfileLinkOverride(PROFILE_ADDRESS + '-x')
    override.profile = Address.fromString(PROFILE_ADDRESS)
    override.key = 'x'
    override.value = 'buildeross'
    override.attestationUID = Bytes.fromHexString(PROFILE_LINK_UID)
    override.transactionHash = Bytes.fromHexString(
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    )
    override.timestamp = BigInt.fromI32(1)
    override.creator = Address.fromString(PROFILE_ADDRESS)
    override.revoked = false
    override.revokedAt = null
    override.revokedBy = null
    override.revokedTxHash = null
    override.save()

    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-x',
      'value',
      'buildeross'
    )
    assert.fieldEquals('ProfileLinkOverride', PROFILE_ADDRESS + '-x', 'revoked', 'false')

    // Update to new value
    const loaded = ProfileLinkOverride.load(PROFILE_ADDRESS + '-x')
    if (loaded) {
      loaded.value = 'newhandle'
      loaded.attestationUID = Bytes.fromHexString(
        '0x2222222222222222222222222222222222222222222222222222222222222222'
      )
      loaded.timestamp = BigInt.fromI32(2)
      loaded.save()
    }

    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-x',
      'value',
      'newhandle'
    )
    assert.fieldEquals('ProfileLinkOverride', PROFILE_ADDRESS + '-x', 'revoked', 'false')
  })

  test('marks ProfileLinkOverride as revoked', () => {
    clearStore()

    // Create override
    const override = new ProfileLinkOverride(PROFILE_ADDRESS + '-discord')
    override.profile = Address.fromString(PROFILE_ADDRESS)
    override.key = 'discord'
    override.value = 'user#1234'
    override.attestationUID = Bytes.fromHexString(PROFILE_LINK_UID)
    override.transactionHash = Bytes.fromHexString(
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    )
    override.timestamp = BigInt.fromI32(1)
    override.creator = Address.fromString(PROFILE_ADDRESS)
    override.revoked = false
    override.revokedAt = null
    override.revokedBy = null
    override.revokedTxHash = null
    override.save()

    // Revoke it
    const loaded = ProfileLinkOverride.load(PROFILE_ADDRESS + '-discord')
    if (loaded) {
      loaded.revoked = true
      loaded.revokedAt = BigInt.fromI32(100)
      loaded.revokedBy = Address.fromString(PROFILE_ADDRESS)
      loaded.revokedTxHash = Bytes.fromHexString(
        '0x3333333333333333333333333333333333333333333333333333333333333333'
      )
      loaded.save()
    }

    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-discord',
      'revoked',
      'true'
    )
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-discord',
      'revokedAt',
      '100'
    )
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-discord',
      'revokedBy',
      PROFILE_ADDRESS
    )
  })

  test('supports multiple link types per profile', () => {
    clearStore()

    // Create multiple link types for same profile
    const website = new ProfileLinkOverride(PROFILE_ADDRESS + '-website')
    website.profile = Address.fromString(PROFILE_ADDRESS)
    website.key = 'website'
    website.value = 'https://example.com'
    website.attestationUID = Bytes.fromHexString(PROFILE_LINK_UID)
    website.transactionHash = Bytes.fromHexString(
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    )
    website.timestamp = BigInt.fromI32(1)
    website.creator = Address.fromString(PROFILE_ADDRESS)
    website.revoked = false
    website.revokedAt = null
    website.revokedBy = null
    website.revokedTxHash = null
    website.save()

    const twitter = new ProfileLinkOverride(PROFILE_ADDRESS + '-x')
    twitter.profile = Address.fromString(PROFILE_ADDRESS)
    twitter.key = 'x'
    twitter.value = 'handle'
    twitter.attestationUID = Bytes.fromHexString(
      '0x2222222222222222222222222222222222222222222222222222222222222222'
    )
    twitter.transactionHash = Bytes.fromHexString(
      '0x1111111111111111111111111111111111111111111111111111111111111111'
    )
    twitter.timestamp = BigInt.fromI32(2)
    twitter.creator = Address.fromString(PROFILE_ADDRESS)
    twitter.revoked = false
    twitter.revokedAt = null
    twitter.revokedBy = null
    twitter.revokedTxHash = null
    twitter.save()

    assert.entityCount('ProfileLinkOverride', 2)
    assert.fieldEquals(
      'ProfileLinkOverride',
      PROFILE_ADDRESS + '-website',
      'key',
      'website'
    )
    assert.fieldEquals('ProfileLinkOverride', PROFILE_ADDRESS + '-x', 'key', 'x')
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
