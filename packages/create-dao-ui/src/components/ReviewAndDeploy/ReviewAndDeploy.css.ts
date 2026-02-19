import { atoms } from '@buildeross/zord'
import { keyframes, style, styleVariants } from '@vanilla-extract/css'

const deployButtonBase = style({
  borderRadius: '10px',
  height: 60,
  marginLeft: 8,
})

const pendingColor = keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
  '100%': { backgroundPosition: '0% 50%' },
})

export const deployPendingButtonStyle = style({
  background:
    'linear-gradient(90deg, rgba(0,3,242,1) 0%, rgba(207,187,21,1) 31%, rgba(85,219,9,1) 52%, rgba(255,0,0,1) 91%);',
  animation: `${pendingColor} 12s ease infinite`,
  backgroundSize: '400% 400%',
})

export const deployContractButtonStyle = styleVariants({
  pending: [deployButtonBase, deployPendingButtonStyle],
  default: [deployButtonBase],
  defaultFull: [deployButtonBase, { width: '100%' }],
  pendingFull: [deployButtonBase, deployPendingButtonStyle, { width: '100%' }],
})

export const deployCheckboxWrapperStyle = style({
  borderRadius: '16px',
  border: `1px solid #F2F2F2`,
})

export const deployCheckboxStyle = style({
  minHeight: 26,
  height: 26,
  width: 26,
  minWidth: 26,
  border: `1px solid #000`,
  borderRadius: '5px',
  selectors: {
    '&:hover': { cursor: 'pointer', background: '#000' },
  },
})

export const deployCheckboxStyleVariants = styleVariants({
  default: [deployCheckboxStyle],
  confirmed: [deployCheckboxStyle, { background: '#000' }],
})

export const deployCheckboxHelperText = style([
  atoms({
    display: 'inline',
  }),
  {
    lineHeight: '24px',
    color: '#808080',
  },
])
