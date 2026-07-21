import { atoms, theme } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const banner = style([
  atoms({
    padding: 'x6',
    borderRadius: 'curved',
    borderWidth: 'thin',
  }),
  {
    backgroundColor: theme.colors.warningDisabled,
    borderColor: theme.colors.warning,
  },
])
