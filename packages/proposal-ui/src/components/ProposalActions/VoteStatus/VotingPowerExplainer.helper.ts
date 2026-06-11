export enum VotingPowerCase {
  Loading = 'LOADING',
  NotConnected = 'NOT_CONNECTED',
  NoTokens = 'NO_TOKENS',
  AcquiredAfterSnapshot = 'ACQUIRED_AFTER_SNAPSHOT',
  DelegatedAway = 'DELEGATED_AWAY',
  CanVote = 'CAN_VOTE',
  CanVoteWithDelegation = 'CAN_VOTE_WITH_DELEGATION',
}

export type VotingPowerInputs = {
  isConnected: boolean
  isLoading: boolean
  snapshotVotes: number // getPastVotes(signer, proposal.timeCreated)
  currentVotes: number // getVotes(signer)
  tokenCount: number // tokens owned now (subgraph)
  delegatedVotes: number // votes delegated to the signer by others (voteCount - own tokens' votes)
  isDelegating: boolean // delegates(signer) !== signer
}

export const getVotingPowerCase = (inputs: VotingPowerInputs): VotingPowerCase => {
  const {
    isConnected,
    isLoading,
    snapshotVotes,
    currentVotes,
    tokenCount,
    delegatedVotes,
    isDelegating,
  } = inputs

  if (snapshotVotes > 0 && delegatedVotes > 0)
    return VotingPowerCase.CanVoteWithDelegation
  if (snapshotVotes > 0) return VotingPowerCase.CanVote
  if (!isConnected) return VotingPowerCase.NotConnected
  if (isLoading) return VotingPowerCase.Loading
  if (tokenCount > 0 && currentVotes === 0 && isDelegating)
    return VotingPowerCase.DelegatedAway
  if (currentVotes > 0 || tokenCount > 0) return VotingPowerCase.AcquiredAfterSnapshot
  return VotingPowerCase.NoTokens
}
