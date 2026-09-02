import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '1rem',
  maxHeight: '50rem',
  overflowY: 'auto',
  paddingRight: '0.25rem',
  '@media': {
    'screen and (max-width: 900px)': { gridTemplateColumns: 'repeat(3, 1fr)' },
    'screen and (max-width: 560px)': { gridTemplateColumns: 'repeat(2, 1fr)' },
  },
})

export const card = style({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  overflow: 'hidden',
})

export const image = style({
  display: 'block',
  width: '100%',
  aspectRatio: '1 / 1',
  objectFit: 'cover',
  background: vars.color.background2,
})

export const cardLabel = style({
  padding: '0.5rem 0.7rem',
  fontSize: '13px',
  fontWeight: 600,
  color: vars.color.text1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
})

export const emptyBox = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '120px',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
})
