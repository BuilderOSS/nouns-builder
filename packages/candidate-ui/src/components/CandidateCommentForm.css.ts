import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

// Signal radio button styles (VoteModal pattern)
export const signalRadioInput = style({
  opacity: 0,
  height: 0,
  width: 0,
  margin: 0,
  padding: 0,
  position: 'absolute',
})

export const signalOption = style({
  position: 'relative',
  backgroundColor: vars.color.background2,
  border: '2px solid transparent',
  borderRadius: vars.radii.curved,
  padding: vars.space.x4,
  height: vars.space.x16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 100ms ease-in-out',
  cursor: 'pointer',

  selectors: {
    '&:hover': {
      borderColor: vars.color.text1,
    },
    '&[data-is-active-positive="true"]': {
      backgroundColor: vars.color.positive,
      color: vars.color.onPositive,
      borderColor: `${vars.color.positive} !important`,
    },
    '&[data-is-active-negative="true"]': {
      backgroundColor: vars.color.negative,
      color: vars.color.onNegative,
      borderColor: `${vars.color.negative} !important`,
    },
    '&[data-is-active-neutral="true"]': {
      backgroundColor: vars.color.neutral,
      color: vars.color.text1,
      borderColor: vars.color.text1,
    },
  },
})

export const signalOptionText = style({
  fontWeight: 700,
  fontSize: '16px',
  '@media': {
    '(min-width: 768px)': {
      fontSize: '18px',
    },
  },
})

// Sponsor card - prominent styling
export const sponsorCard = style({
  backgroundColor: vars.color.background2,
  border: `2px solid ${vars.color.border}`,
  borderRadius: vars.radii.curved,
  padding: vars.space.x4,
  transition: 'all 150ms ease-in-out',

  selectors: {
    '&:hover': {
      borderColor: vars.color.accent,
      backgroundColor: `color-mix(in srgb, ${vars.color.accent} 5%, ${vars.color.background2})`,
    },
    '&[data-is-active="true"]': {
      borderColor: vars.color.accent,
      backgroundColor: `color-mix(in srgb, ${vars.color.accent} 10%, ${vars.color.background2})`,
      boxShadow: `0 0 0 1px ${vars.color.accent}`,
    },
  },
})

export const sponsorLabel = style({
  fontWeight: 700,
  fontSize: '16px',
})

export const sponsorBadge = style({
  backgroundColor: vars.color.background1,
  color: vars.color.text3,
  padding: `${vars.space.x1} ${vars.space.x2}`,
  borderRadius: vars.radii.phat,
  fontSize: '12px',
  fontWeight: 600,
})
