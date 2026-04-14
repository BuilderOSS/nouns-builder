import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const modalHeader = style([
  atoms({
    pb: 'x4',
  }),
  {
    borderBottom: `1px solid ${vars.color.border}`,
    selectors: {
      'html[data-theme-mode="dark"] &': {
        borderBottom: '1px solid #4a4d57',
      },
    },
  },
])

export const modalTitle = style({
  fontSize: '20px',
  fontWeight: 600,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
    },
  },
})

export const filterSummary = style([
  atoms({
    pt: 'x2',
    gap: 'x2',
  }),
  {
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: '14px',
    color: vars.color.text3,
    selectors: {
      'html[data-theme-mode="dark"] &': {
        color: vars.color.text2,
      },
    },
  },
])

export const summaryChip = style([
  atoms({
    px: 'x2',
    pt: 'x1',
    pb: 'x1',
    borderRadius: 'small',
  }),
  {
    backgroundColor: vars.color.background2,
    fontSize: '12px',
    selectors: {
      'html[data-theme-mode="dark"] &': {
        backgroundColor: '#2a2b31',
        color: vars.color.text1,
      },
    },
  },
])

export const modalBody = style([
  atoms({
    pt: 'x4',
    pb: 'x4',
    gap: 'x6',
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '60vh',
    overflowY: 'auto',
    selectors: {
      'html[data-theme-mode="dark"] &': {
        backgroundColor: '#1f2024',
      },
    },
  },
])

export const filterSection = style([
  atoms({
    gap: 'x3',
  }),
  {
    display: 'flex',
    flexDirection: 'column',
  },
])

export const sectionLabel = style({
  fontSize: '14px',
  fontWeight: 600,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
    },
  },
})

export const filterGrid = style([
  atoms({
    gap: 'x2',
  }),
  {
    display: 'grid',
    gridTemplateColumns: '1fr',
    '@media': {
      'screen and (min-width: 768px)': {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
    },
  },
])

export const filterItem = style([
  atoms({
    cursor: 'pointer',
    pt: 'x2',
    pb: 'x2',
    px: 'x3',
    borderRadius: 'small',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: vars.color.background2,
    },
    selectors: {
      'html[data-theme-mode="dark"] &': {
        backgroundColor: '#2a2b31',
      },
      'html[data-theme-mode="dark"] &:hover': {
        backgroundColor: '#3b3e47',
      },
    },
  },
])

export const chainIcon = style({
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  flexShrink: 0,
})

export const modalFooter = style([
  atoms({
    pt: 'x4',
    gap: 'x3',
  }),
  {
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: `1px solid ${vars.color.border}`,
    selectors: {
      'html[data-theme-mode="dark"] &': {
        borderTop: '1px solid #4a4d57',
      },
    },
  },
])

export const radioGroup = style([
  atoms({
    gap: 'x2',
  }),
  {
    display: 'flex',
    flexDirection: 'column',
  },
])
