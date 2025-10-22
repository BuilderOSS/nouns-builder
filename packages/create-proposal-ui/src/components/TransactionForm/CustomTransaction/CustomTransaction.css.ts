import { atoms, theme } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const defaultBackButton = style([
  atoms({ color: 'accent' }),
  {
    background: theme.colors.background2,
    borderRadius: '10px',
    selectors: {
      '&:hover': {
        cursor: 'pointer',
      },
    },
  },
])

export const defaultBackButtonVariants = styleVariants({
  default: [defaultBackButton],
  transaction: [
    {
      background: '#f2f2f2',
      boxSizing: 'border-box',
      width: 'auto',
      height: 40,
      borderRadius: '8px',
      color: '#B3B3B3',
      selectors: {
        '&:hover': {
          cursor: 'pointer',
          color: '#000',
        },
      },
    },
  ],
})

export const transactionFormButtonWithPrev = style({
  marginLeft: 'auto',
  fontFamily: 'Inter, sans-serif!important',
  fontSize: 16,
  borderRadius: '8px',
  padding: '8px 16px',
  height: 'auto',
  minWidth: 66,
  // maxWidth: 66,
})

export const defaultInputLabelStyle = style([
  atoms({
    display: 'block',
    fontSize: 16,
    paddingBottom: 'x2',
  }),
  {
    whiteSpace: 'nowrap',
    fontWeight: '700',
  },
])

export const customTransactionWrapper = style({
  borderRadius: '12px',
})

export const transactionFormWrapper = style({
  position: 'relative',
  top: 20,
  width: '100%',
  '@media': {
    '(max-width: 768px)': {
      position: 'relative',
      padding: 0,
      width: '100%',
    },
  },
})

export const transactionFlowHeading = style({
  fontSize: '22px',
  fontWeight: 700,
})

export const transactionFlowWrapper = style({
  display: 'flex',
})
