import { atoms, vars } from '@buildeross/zord'
import { style, styleVariants } from '@vanilla-extract/css'

export const defaultFormAdvancedWrapper = style({
  overflow: 'hidden',
})

export const defaultFormAdvancedToggle = style({
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 700,
  backgroundColor: vars.color.background1,
  color: vars.color.text1,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${vars.color.background2} !important`,
    },
  },
})

export const defaultFormHeading = style({
  fontSize: 24,
  margin: 0,
  marginBottom: 15,
})

export const defaultFieldsetStyle = style({
  position: 'relative',
  border: 0,
  padding: 0,
})

export const defaultTextAreaStyle = style({
  minHeight: 250,
  resize: 'none',
  backgroundColor: vars.color.background2,
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingTop: 25,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.background1}`,
  whiteSpace: 'pre-line',
  wordBreak: 'break-word',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
  },
})

export const defaultTextAreaErrorStyle = style({
  minHeight: 250,
  resize: 'none',
  backgroundColor: vars.color.background2,
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingTop: 25,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.negative}`,
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.negative,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
  },
})

export const defaultInputStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: vars.color.background2,
  borderRadius: '12px',
  fontSize: 16,
  paddingLeft: 16,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.background1}`,
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
    '&::placeholder': {
      color: vars.color.text4,
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
})

export const defaultInputErrorStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: vars.color.background2,
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 16,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.negative}`,
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.negative,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
})

export const inputStyleVariants = styleVariants({
  default: [defaultInputStyle],
  error: [defaultInputErrorStyle],
})

export const defaultInputLabelStyle = style([
  atoms({
    display: 'inline-flex',
    fontSize: 16,
    width: '100%',
    mb: 'x4',
  }),
  {
    whiteSpace: 'nowrap',
    fontWeight: '700',
  },
])

export const defaultFileDownloadStyle = style([
  atoms({
    display: 'flex',
    alignItems: 'center',
  }),
  {
    fontWeight: 700,
  },
])

export const defaultInputErrorMessageStyle = style({
  color: vars.color.negative,
})

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: vars.color.negative,
  boxSizing: 'border-box',
})

export const uploadSuccessBox = style({
  color: vars.color.positive,
  boxSizing: 'border-box',
})

export const defaultUploadButtonStyle = style({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  background: vars.color.background2,
  fontWeight: 700,
  boxSizing: 'border-box',
  borderRadius: '10px',
  width: '100%',
  justifyContent: 'space-between',
  cursor: 'pointer',
})

export const defaultHelperTextStyle = style({
  fontSize: 16,
  lineHeight: '24px',
  color: vars.color.text3,
  boxSizing: 'border-box',
  padding: '10px 0',
  whiteSpace: 'pre-line',
})

export const numberInputStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: vars.color.background2,
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingRight: 25,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.background1}`,
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
    '&::-webkit-input-placeholder': {
      textAlign: 'right',
    },
    '&::placeholder': {
      color: vars.color.text4,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
})

export const errorMessageStyle = style({
  color: vars.color.negative,
  fontSize: '10px',
})

export const numberInputErrorStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: vars.color.background2,
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingRight: 25,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.negative}`,
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.negative,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.focusRing}`,
      outlineOffset: '2px',
    },
    '&::-webkit-input-placeholder': {
      textAlign: 'right',
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
})

export const dropAreaStyle = style({
  border: `2px solid ${vars.color.background1}`,
  borderRadius: '10px',
})

export const dropAreaErrorStyle = style({
  border: `2px solid ${vars.color.negative}`,
  borderRadius: '10px',
})

export const noneSelectedStyle = style({
  color: vars.color.text4,
})

export const placeholderStyle = style({
  top: '50%',
  right: '7%',
  height: '26px',
  marginTop: '-23px',
  background: 'inherit',
  fontSize: 10,
  '@media': {
    'screen and (max-width: 768px)': {
      right: '27px',
      marginTop: '-22px',
      fontSize: 16,
    },
  },
})

export const permaInputPlaceHolderStyle = style({
  right: '16px',
  height: '26px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'inherit',
})

export const inputCheckIcon = styleVariants({
  default: [
    {
      right: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'inherit',
      height: 24,
      width: 24,
      borderRadius: '12px',
      backgroundColor: vars.color.positive,
    },
  ],
})

export const defaultSelectStyle = style({
  padding: 10,
  marginBottom: '24px',
})

export const defaultDropdownSelectOptionStyle = style({
  backgroundColor: vars.color.background1,
  color: vars.color.text1,
  ':hover': {
    backgroundColor: vars.color.background2,
  },
})

export const confirmRemoveHeadingStyle = style({
  fontSize: 24,
  lineHeight: '30px',
  fontWeight: 700,
})

export const confirmRemoveHelper = style({
  color: vars.color.text3,
  fontSize: 16,
  lineHeight: '24px',
  marginBottom: 8,
})

const pointer = style({
  padding: 0,
  background: vars.color.background2,
  border: `2px solid ${vars.color.background2}`,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      border: `2px solid ${vars.color.text3}`,
    },
  },
})

export const radioStyles = styleVariants({
  default: [pointer],
  active: [pointer, { border: `2px solid ${vars.color.text1}` }],
})

export const adminStickySaveWrapper = style({
  borderTop: `2px solid ${vars.color.background2}`,
  background: vars.color.background1,
  zIndex: 1,
  '@media': {
    '(max-width: 768px)': {
      paddingLeft: 20,
      paddingRight: 20,
    },
  },
})

export const adminStickySaveButton = style({
  display: 'flex',
  height: 64,
  width: 566,
  fontFamily: 'Inter, sans-serif!important',
  borderRadius: '12px',
  '@media': {
    '(max-width: 768px)': {
      width: '100%',
    },
  },
})

export const confirmFormWrapper = style({
  width: 540,
  margin: '0 auto',
})

export const deployCheckboxStyle = style({
  minHeight: 26,
  height: 26,
  width: 26,
  minWidth: 26,
  border: `1px solid ${vars.color.text1}`,
  borderRadius: '5px',
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

// Responsive grid styles for time inputs
export const mobileResponsiveGrid = style({
  gridTemplateColumns: '1fr 1fr',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

export const mobileTwoColumnGrid = style({
  gridTemplateColumns: '1fr 1fr 1fr 1fr',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
})

export const mobileThreeColumnGrid = style({
  gridTemplateColumns: '1fr 1fr 1fr',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
})
