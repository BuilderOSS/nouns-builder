import { atoms } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

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
  marginBottom: '0.5rem',
  borderRadius: '4px',
  overflow: 'hidden',
})

export const baseContainer = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'x2',
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
  {
    width: '30px',
    height: '30px',
  },
])

export const statusContainer = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'x4',
  }),
])

export const transactionPreview = style([
  atoms({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: 'x5',
    padding: 'x4',
    backgroundColor: 'background1',
    borderRadius: 'curved',
    borderWidth: 'normal',
    borderStyle: 'solid',
    borderColor: 'border',
  }),
  {
    maxWidth: 912,
    margin: '0 auto',
  },
])
