import * as CreateProposalUI from '@buildeross/create-proposal-ui'

describe('EAS SDK package integration', () => {
  it('loads create-proposal-ui without failing on the EAS contracts barrel', () => {
    expect(Object.keys(CreateProposalUI).length).toBeGreaterThan(0)
  })
})
