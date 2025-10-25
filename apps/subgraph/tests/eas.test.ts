import { Address, Bytes } from '@graphprotocol/graph-ts'
import { assert, describe, test } from 'matchstick-as'

import { decodeDaoMultisig, decodePropdate } from '../src/utils/eas'

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
})
