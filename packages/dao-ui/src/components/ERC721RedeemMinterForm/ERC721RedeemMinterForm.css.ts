import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const settingsCard = style({
  padding: '20px 24px',
  borderRadius: '12px',
  background: vars.color.background2,
  marginBottom: 16,
})

export const settingsRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
})

export const settingsLabel = style({
  fontSize: 14,
  fontWeight: 500,
  color: vars.color.text3,
})

export const settingsValue = style({
  fontSize: 16,
  fontWeight: 600,
  color: vars.color.text1,
  fontFamily: 'monospace',
})

export const tokenIdInput = style({
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: `1px solid ${vars.color.border}`,
  fontSize: 16,
  fontFamily: 'monospace',
  background: vars.color.background1,
  color: vars.color.text1,
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: vars.color.primary,
    },
    '&::placeholder': {
      color: vars.color.text4,
    },
  },
})

export const tokenIdPreview = style({
  padding: '12px 16px',
  borderRadius: '8px',
  background: vars.color.background2,
  fontSize: 14,
  fontFamily: 'monospace',
  color: vars.color.text3,
  marginTop: 8,
  maxHeight: 120,
  overflowY: 'auto',
})

export const errorMessage = style({
  color: vars.color.negative,
  fontSize: 14,
  marginTop: 8,
})

export const feeBreakdown = style({
  padding: '16px',
  borderRadius: '8px',
  background: vars.color.background2,
  marginTop: 16,
})

export const feeRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
})

export const feeLabel = style({
  fontSize: 14,
  color: vars.color.text3,
})

export const feeValue = style({
  fontSize: 14,
  fontWeight: 600,
  color: vars.color.text1,
  fontFamily: 'monospace',
})

export const totalFee = style([
  feeRow,
  {
    borderTop: `1px solid ${vars.color.border}`,
    paddingTop: 12,
    marginTop: 8,
  },
])

export const actionButton = style({
  width: '100%',
  marginTop: 16,
})
