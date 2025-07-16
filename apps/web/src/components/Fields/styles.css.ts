import { style, styleVariants } from '@vanilla-extract/css'
import { atoms, theme } from '@zoralabs/zord'

export const defaultFormAdvancedWrapper = style({
  overflow: 'hidden',
})

export const defaultFormAdvancedToggle = style({
  fontSize: 16,
  lineHeight: '24px',
  fontWeight: 700,
  backgroundColor: 'white',
  color: 'black',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: '#eee !important',
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
  overflow: 'hidden',
})

export const defaultTextAreaStyle = style({
  minHeight: 250,
  resize: 'none',
  backgroundColor: '#F2F2F2',
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingTop: 25,
  boxSizing: 'border-box',
  border: '2px solid #fff',
  whiteSpace: 'pre-line',
  wordBreak: 'break-word',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
  },
})

export const defaultTextAreaErrorStyle = style({
  minHeight: 250,
  resize: 'none',
  backgroundColor: '#F2F2F2',
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingTop: 25,
  boxSizing: 'border-box',
  border: '2px solid #ff0015',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
  },
})

export const defaultInputStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: '#F2F2F2',
  borderRadius: '12px',
  fontSize: 16,
  paddingLeft: 16,
  boxSizing: 'border-box',
  border: '2px solid #fff',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
    '&::placeholder': {
      color: '#B3B3B3',
    },
  },
})

export const defaultInputErrorStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: '#F2F2F2',
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 16,
  boxSizing: 'border-box',
  border: '2px solid #ff0015',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
  },
})

export const inputStyleVariants = styleVariants({
  default: [defaultInputStyle],
  error: [defaultInputErrorStyle],
})

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

export const defaultFormButtonWithPrev = style({
  width: 'calc(100% - 68px)',
  borderRadius: '10px',
  height: 60,
  marginLeft: 8,
})

export const defaultFormButton = style({
  width: '100%',
  borderRadius: '10px',
  height: 60,
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
  color: '#ff0015',
})

export const defaultUploadStyle = style({
  display: 'none',
})

export const uploadErrorBox = style({
  color: '#ff0015',
  boxSizing: 'border-box',
})

export const uploadSuccessBox = style({
  color: '#1CB687',
  boxSizing: 'border-box',
})

export const artworkPreviewPanel = style([
  atoms({
    position: 'fixed',
    left: 'x0',
    top: 'x0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  {
    minHeight: '100vh',
    width: '50vw',
    borderRight: '2px solid #F2F2F2',
    background: '#fff',
    '@media': {
      'screen and (max-width: 768px)': {
        width: '100%',
        height: 'auto',
        position: 'relative',
        border: 0,
        minHeight: 'auto',
        padding: '20px 0',
      },
    },
  },
])

export const artworkPreviewImageWrapper = style({
  width: 448,
  height: 448,
  background: '#f2f2f2',
  borderRadius: '12px',
  overflow: 'hidden',
  '@media': {
    'screen and (max-width: 1000px)': {
      width: (448 * 3) / 4,
      height: (448 * 3) / 4,
    },
    'screen and (max-width: 768px)': {
      width: '100%',
      height: '100%',
    },
  },
})

export const artworkPreviewGenerateButton = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const defaultUploadButtonStyle = style({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  background: '#F2F2F2',
  fontWeight: 700,
  boxSizing: 'border-box',
  borderRadius: '10px',
  width: '100%',
  justifyContent: 'space-between',
})

export const defaultHelperTextStyle = style({
  fontSize: 16,
  lineHeight: '24px',
  color: '#808080',
  boxSizing: 'border-box',
  padding: '10px 0',
  whiteSpace: 'pre-line',
})

export const numberInputStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: '#F2F2F2',
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingRight: 25,
  boxSizing: 'border-box',
  border: '2px solid #fff',
  overflow: 'hidden',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
    '&::-webkit-input-placeholder': {
      textAlign: 'right',
    },
    '&::placeholder': {
      color: '#B3B3B3',
    },
  },
})

export const errorMessageStyle = style({
  color: '#ff0015',
  fontSize: '10px',
})

export const numberInputErrorStyle = style({
  height: 64,
  width: '100%',
  backgroundColor: '#F2F2F2',
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  paddingRight: 25,
  boxSizing: 'border-box',
  border: '2px solid #ff0015',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
    '&::-webkit-input-placeholder': {
      textAlign: 'right',
    },
  },
})

export const dropAreaStyle = style({
  border: '2px solid #fff',
  borderRadius: '10px',
})

export const dropAreaErrorStyle = style({
  border: '2px solid #ff0015',
  borderRadius: '10px',
})

export const noneSelectedStyle = style({
  color: '#B3B3B3',
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
  top: 57,
  background: 'inherit',
})

export const inputCheckIcon = styleVariants({
  default: [
    permaInputPlaceHolderStyle,
    { top: 52, height: 24, width: 24, borderRadius: '12px', backgroundColor: '#1CB687' },
  ],
})

export const defaultSelectStyle = style({
  padding: 10,
  marginBottom: '24px',
})

export const defaultDropdownSelectOptionStyle = style({
  ':hover': {
    backgroundColor: '#F2F2F2',
  },
})

export const confirmRemoveHeadingStyle = style({
  fontSize: 24,
  lineHeight: '30px',
  fontWeight: 700,
})

export const confirmRemoveHelper = style({
  color: '#808080',
  fontSize: 16,
  lineHeight: '24px',
  marginBottom: 8,
})

const pointer = {
  background: '#F2F2F2',
  border: '2px solid #F2F2F2',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      border: '2px solid #8c8c8c',
    },
  },
}

export const radioStyles = styleVariants({
  default: [pointer],
  active: [pointer, { border: '2px solid #000' }],
})
