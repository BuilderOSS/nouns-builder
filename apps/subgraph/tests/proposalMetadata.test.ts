import { assert, describe, test } from 'matchstick-as'

import { parseProposalMetadata } from '../src/utils/proposalMetadata'

describe('Proposal metadata parser', () => {
  test('parses canonical proposal metadata JSON', () => {
    const parsed = parseProposalMetadata(
      '{"version":1,"title":"JSON title","description":"JSON body","representedAddress":"0x1234","discussionUrl":"https://example.com/discussion","transactionBundles":[{"type":"transfer","callCount":1}]}'
    )

    assert.assertNotNull(parsed)
    if (!parsed) return

    assert.stringEquals(parsed.title, 'JSON title')
    assert.stringEquals(parsed.description, 'JSON body')
    assert.stringEquals(parsed.representedAddress, '0x1234')
    assert.stringEquals(parsed.discussionUrl, 'https://example.com/discussion')
  })

  test('returns null for non-json metadata', () => {
    const parsed = parseProposalMetadata('Legacy title&&Legacy body')
    assert.assertTrue(parsed == null)
  })
})
