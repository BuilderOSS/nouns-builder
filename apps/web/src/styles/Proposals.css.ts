import { style, styleVariants } from '@vanilla-extract/css'
import { atoms, vars } from '@zoralabs/zord'

/* TREASURY */
export const treasuryWrapper = style({
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 1080px)': {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

export const erc20AssetsWrapper = style({
  gridTemplateColumns: '3fr 2fr 1.5fr',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

export const erc721AssetsWrapper = style({
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridGap: '0.5rem',
  '@media': {
    'screen and (max-width: 720px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    'screen and (max-width: 420px)': {
      gridTemplateColumns: 'repeat(1, 1fr)',
    },
  },
})

/* PROPOSALS */
export const proposalFormTitle = style({
  lineHeight: 1,
  fontWeight: 700,
  fontSize: '20px',
  '@media': {
    '(min-width: 768px)': {
      fontSize: '28px',
    },
  },
})

export const delegateBtn = style({
  fontFamily: 'ptRoot !important',
  height: '40px !important',
  color: '#000 !important',
  backgroundColor: '#FFF !important',
  ':hover': {
    backgroundColor: '#F9F9F9 !important',
  },
})

export const createProposalBtn = style({
  fontFamily: 'ptRoot !important',
  height: '40px !important',
})

export const selectDelegateBtn = style({
  fontSize: '1rem',
  fontFamily: 'ptRoot !important',
  borderRadius: '12px',
  height: 40,
})

export const animatedPanel = style({
  height: '100vh',
  width: '100vw',
  position: 'fixed',
  background: '#fff',
  top: 0,
  left: 0,
  transform: 'translateY(105%)',
  boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.3)',
  zIndex: 1,
})

export const animatedPanelInner = style({
  overflowY: 'scroll',
  height: `calc(100% - 96px)`,
})

export const panelProposalWrapper = style({
  maxWidth: 680,
  width: '100%',
})

export const panelCloseButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

/* /votes/[id] */
export const propPageWrapper = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  }),
  {
    maxWidth: 912,
    margin: '0 auto',
    '@media': {
      '(min-width: 768px)': {
        margin: '0 auto',
      },
    },
  },
])

export const propDataGrid = style([
  atoms({ gap: 'x4' }),
  {
    gridTemplateColumns: '1fr 1fr 1fr',
    '@media': {
      'screen and (max-width: 768px)': {
        gridTemplateColumns: '1fr',
        gap: '8px',
      },
    },
  },
])

export const voteModalFieldset = style({
  outline: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
})

export const voteModalRadioInput = style({
  opacity: 0,
  height: 0,
  width: 0,
  margin: 0,
  padding: 0,
})

export const voteModalOption = style({
  border: '2px solid transparent',
  transition: 'all 100ms',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      borderColor: '#000000',
    },
    '&[data-is-active-negative="true"]': {
      backgroundColor: '#F03232',
      color: '#ffffff',
      borderColor: '#F03232 !important',
    },
    '&[data-is-active-positive="true"]': {
      backgroundColor: '#1CB687',
      color: '#ffffff',
      borderColor: '#1CB687 !important',
    },
    '&[data-is-active-neutral="true"]': {
      backgroundColor: vars.color.neutral,
      borderColor: '#000000',
    },
  },
})

export const voteModalOptionText = style({
  fontWeight: 700,
  fontSize: '16px',
  '@media': {
    '(min-width: 768px)': {
      fontSize: '18px',
    },
  },
})

export const voteModalReason = style({
  outline: 'none',
  border: '1px solid transparent',
  appearance: 'none',
  resize: 'none',
})

export const proposalActionButton = style([
  atoms({
    fontSize: 16,
    borderRadius: 'curved',
  }),
  {
    padding: '8px 16px',
    maxHeight: 40,
  },
])

export const proposalActionButtonVariants = styleVariants({
  vote: [proposalActionButton],
  voteDisabled: [
    proposalActionButton,
    atoms({
      fontWeight: 'display',
      color: 'text3',
      backgroundColor: 'border',
      justifyContent: 'center',
    }),
  ],
  cancel: [
    proposalActionButton,
    {
      background: '#F2F2F2',
      color: '#000000',
      minWidth: 149,
    },
  ],
  queue: [
    proposalActionButton,
    {
      background: '#D16BE1',
      width: '100%',
    },
  ],
  execute: [
    proposalActionButton,
    {
      background: '#257CED',
      width: '100%',
    },
  ],
})
