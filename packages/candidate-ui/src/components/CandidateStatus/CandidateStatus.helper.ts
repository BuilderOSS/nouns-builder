import { theme } from '@buildeross/zord'

export enum CandidateState {
  Draft = 'Draft',
  Promoted = 'Promoted',
}

export type CandidateStateColorStyle = {
  borderColor: string
  color: string
}

export const candidateStateColorStyles: Record<CandidateState, CandidateStateColorStyle> =
  {
    [CandidateState.Draft]: {
      borderColor: theme.colors.focusRing,
      color: theme.colors.focusRing,
    },
    [CandidateState.Promoted]: {
      borderColor: theme.colors.positiveDisabled,
      color: theme.colors.positive,
    },
  }

export const getCandidateStateColorStyle = (
  state: CandidateState
): CandidateStateColorStyle =>
  candidateStateColorStyles[state] || candidateStateColorStyles[CandidateState.Draft]

export function parseState(state: CandidateState) {
  switch (state) {
    case CandidateState.Draft:
      return 'Draft'
    case CandidateState.Promoted:
      return 'Promoted'
    default:
      return 'Draft'
  }
}

export function parseBgColor(state: CandidateState) {
  return getCandidateStateColorStyle(state)
}
