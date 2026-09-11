import { atoms, vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const splitPayoutWrapper = style([
  atoms({
    p: 'x6',
    borderRadius: 'curved',
    backgroundColor: 'background2',
    borderColor: 'border',
    borderWidth: 'thin',
    borderStyle: 'solid',
  }),
])

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
})

export const balanceSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  paddingBottom: '1.5rem',
  borderBottomStyle: 'solid',
  borderBottomWidth: '1px',
  borderBottomColor: vars.color.border,
})

export const balanceHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  gap: '1rem',
})

export const recipientsSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
})

export const recipientsHeader = style({
  fontSize: '14px',
  fontWeight: 600,
  color: vars.color.text2,
  marginBottom: '0.5rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
})

export const recipientsList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '100%',
})

export const splitRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  width: '100%',
})

export const recipientAddress = style({
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text1,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.accent,
    textDecoration: 'underline',
  },
})

export const share = style({
  fontSize: '14px',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.text2,
  whiteSpace: 'nowrap',
})

export const amount = style({
  fontSize: '28px',
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.text1,
  lineHeight: 1.2,
})

export const label = style({
  fontSize: '13px',
  color: vars.color.text3,
  fontWeight: 500,
})

export const splitLink = style({
  fontSize: '12px',
  color: vars.color.text3,
  fontWeight: 500,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.text2,
    textDecoration: 'underline',
  },
})

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  paddingTop: '0.5rem',
})
