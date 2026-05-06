import { atoms, vars } from '@buildeross/zord'
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
  background: `linear-gradient(90deg, ${vars.color.primary} 0%, ${vars.color.warning} 31%, ${vars.color.positive} 52%, ${vars.color.negative} 91%)`,
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
  border: `1px solid ${vars.color.background2}`,
})

export const deployCheckboxStyle = style({
  minHeight: 26,
  height: 26,
  width: 26,
  minWidth: 26,
  border: `1px solid ${vars.color.text1}`,
  borderRadius: '5px',
  padding: 0,
  selectors: {
    '&:hover': { cursor: 'pointer', background: vars.color.text1 },
  },
})

export const deployCheckboxStyleVariants = styleVariants({
  default: [deployCheckboxStyle],
  confirmed: [deployCheckboxStyle, { background: vars.color.text1 }],
})

export const deployCheckboxHelperText = style([
  atoms({
    display: 'inline',
  }),
  {
    lineHeight: '24px',
    color: vars.color.text3,
  },
])
