import { style } from '@vanilla-extract/css'
import { atoms } from '@zoralabs/zord'

export const walletConnectContainer = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    borderColor: 'border',
    backgroundColor: 'background2',
    padding: 'x6',
  }),
])

export const walletConnectLogo = style({
  marginBottom: '1.5rem',
  borderRadius: '4px',
  overflow: 'hidden',
})

export const baseContainer = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  }),
])

export const buttonsContainer = style([
  atoms({
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: 'x6',
    gap: 'x4',
  }),
  {
    width: '70%',
  },
])

export const successIcon = style([
  atoms({
    color: 'positive',
  }),
  {
    width: '30px',
    height: '30px',
    marginBottom: '1rem',
  },
])

export const loadingContainer = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'x4',
  }),
])

export const transactionPreview = style([
  atoms({
    marginTop: 'x5',
    padding: 'x4',
    backgroundColor: 'background1',
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    borderColor: 'border',
  }),
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
