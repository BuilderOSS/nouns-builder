import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const modalHeader = style([
  atoms({
    pb: 'x4',
  }),
  {
    borderBottom: `1px solid ${vars.color.border}`,
  },
])

export const modalTitle = style({
  fontSize: '20px',
  fontWeight: 600,
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
    ':hover': {
      backgroundColor: vars.color.background2,
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
