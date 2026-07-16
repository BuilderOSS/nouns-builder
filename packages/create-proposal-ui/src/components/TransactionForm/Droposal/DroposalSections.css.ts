import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

/** Grouped-section card for the droposal builder — Builder tokens only. */
export const section = style({
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: vars.color.border,
  borderRadius: vars.radii.curved,
  padding: '1.25rem 1.25rem 1.35rem',
})

export const sectionHead = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: '1rem',
  marginBottom: '1.1rem',
})

export const eyebrow = style({
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: vars.color.text3,
})

export const sectionHint = style({
  fontSize: '12px',
  color: vars.color.text4,
})

/** Two-up field row that collapses to one column on narrow widths. */
export const grid2 = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  '@media': {
    'screen and (max-width: 560px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

/** Collapsible "Advanced" header button. */
export const advancedToggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  border: 'none',
  background: 'transparent',
  padding: 0,
  cursor: 'pointer',
  color: vars.color.text3,
  fontFamily: 'inherit',
})

export const advancedChevron = style({
  transition: 'transform 0.15s ease',
  color: vars.color.text3,
  fontSize: '16px',
})

export const advancedChevronOpen = style({
  transform: 'rotate(90deg)',
})
