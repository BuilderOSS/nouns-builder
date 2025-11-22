import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const selectorContainer = style([
  atoms({
    gap: 'x3',
  }),
  {
    display: 'flex',
    flexDirection: 'column',
  },
])

export const searchInput = style([
  atoms({
    w: '100%',
    px: 'x3',
    pt: 'x2',
    pb: 'x2',
    borderRadius: 'small',
  }),
  {
    border: `1px solid ${vars.color.border}`,
    fontSize: '14px',
    transition: 'border-color 0.2s ease',
    ':focus': {
      outline: 'none',
      borderColor: vars.color.primary,
    },
  },
])

export const daoList = style([
  atoms({
    gap: 'x2',
  }),
  {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '300px',
    overflowY: 'auto',
  },
])

export const daoItem = style([
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

export const daoImage = style({
  width: '32px',
  height: '32px',
  borderRadius: '4px',
  objectFit: 'cover',
  flexShrink: 0,
})

export const daoInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
  minWidth: 0,
})

export const daoName = style({
  fontSize: '14px',
  fontWeight: 500,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const daoAddress = style({
  fontSize: '12px',
  color: vars.color.text3,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const selectedChips = style([
  atoms({
    gap: 'x2',
  }),
  {
    display: 'flex',
    flexWrap: 'wrap',
  },
])

export const chip = style([
  atoms({
    px: 'x2',
    pt: 'x1',
    pb: 'x1',
    borderRadius: 'small',
  }),
  {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: vars.color.background2,
    fontSize: '12px',
  },
])

export const chipRemove = style([
  atoms({
    cursor: 'pointer',
  }),
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: vars.color.accentHover,
    },
  },
])

export const emptyState = style({
  padding: '24px',
  textAlign: 'center',
  color: vars.color.text3,
  fontSize: '14px',
})

export const sectionTitle = style({
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  color: vars.color.text3,
  letterSpacing: '0.5px',
})
