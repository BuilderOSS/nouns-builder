import { Bytes } from '@graphprotocol/graph-ts'

const CREATE_BID_SELECTOR = '0x659dd2b4'
const CREATE_BID_WITH_REFERRAL_SELECTOR = '0xc0d5bb8b'

const CREATE_BID_ARGS_LENGTH = 32
const CREATE_BID_WITH_REFERRAL_ARGS_LENGTH = 64

function readCommentFromInput(input: Bytes, argsLength: i32): string | null {
  const commentOffset = 4 + argsLength
  if (input.length <= commentOffset) {
    return null
  }

  const commentBytes = changetype<Bytes>(input.subarray(commentOffset))
  const comment = commentBytes.toString()
  return comment.length > 0 ? comment : null
}

export function parseAuctionBidComment(input: Bytes): string | null {
  if (input.length < 4) {
    return null
  }

  const selector = changetype<Bytes>(input.subarray(0, 4)).toHexString()

  if (selector == CREATE_BID_SELECTOR) {
    return readCommentFromInput(input, CREATE_BID_ARGS_LENGTH)
  }

  if (selector == CREATE_BID_WITH_REFERRAL_SELECTOR) {
    return readCommentFromInput(input, CREATE_BID_WITH_REFERRAL_ARGS_LENGTH)
  }

  return null
}
