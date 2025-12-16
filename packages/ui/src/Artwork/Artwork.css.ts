import { atoms, vars } from '@buildeross/zord'
import { keyframes, style } from '@vanilla-extract/css'

export const artworkSettingsBox = style({
  border: '2px solid #F2F2F2',
  borderRadius: '10px',
})

export const artworkSettingsBoxDropping = style({
  border: '2px solid #1CB687',
  borderRadius: '10px',
  background: '#1CB687',
})

export const artworkSettingsName = style({
  color: '#4D4D4D',
  fontWeight: 700,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const artworkSettingsNameDropping = style({
  color: '#fff',
  fontWeight: 700,
  textAlign: 'center',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const artworkSettingsPropertyName = style({
  height: 50,
  width: '100%',
  backgroundColor: '#F2F2F2',
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  boxSizing: 'border-box',
  border: '2px solid #fff',
  color: '#808080',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
  },
})

export const artworkSettingsImageThumb = style({
  width: '100%',
})

export const artworkSettingsPropertyCount = style({
  height: 80,
  width: 80,
  borderRadius: '15px',
  fontSize: 16,
  border: '2px solid #fff',
  maxWidth: '100px',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: '#FFF',
      borderColor: '#E6E6E6',
    },
  },
})

export const layerSelectStyle = style([
  atoms({
    mb: 'x2',
    px: 'x4',
    pt: 'x3',
    width: '100%',
    alignItems: 'center',
  }),
  {
    minHeight: 62,
    background: '#F2F2F2',
    border: 0,
    borderRadius: '12px',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  },
])

export const previewHeadingStyle = style([
  atoms({
    mb: 'x6',
  }),
  {
    lineHeight: 1,
    fontWeight: 500,
    fontSize: '20px',
    '@media': {
      '(min-width: 768px)': {
        fontSize: '28px',
      },
    },
  },
])

export const selectTraitNameStyle = style([
  atoms({
    pointerEvents: 'none',
    pt: 'x1',
  }),
  {
    zIndex: 1,
    color: '#808080',
    opacity: 0.6,
    fontWeight: 400,
    // top: '28%',
  },
])

export const selectTraitNameWrapper = style({
  maxHeight: 400,
  overflow: 'hidden',
  overflowY: 'auto',
})

export const previewGeneratedImageStyle = style({
  height: 175,
  width: 175,
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.25)',
})

export const previewModalWrapperStyle = style({
  borderRadius: '24px',
  width: '100%',
  maxWidth: '832px',
})

export const previewLayerSelectorWrapperStyle = style({
  minWidth: 245,
  maxWidth: 245,
  '@media': {
    'screen and (max-width: 1050px)': {
      minWidth: 200,
      maxWidth: 200,
    },
    'screen and (max-width: 768px)': {
      width: '100%',
      maxWidth: 'none',
    },
  },
})

export const previewWrapperInnerStyle = style({
  '@media': {
    'screen and (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
})

export const previewGridWrapperStyle = style({
  overflowY: 'auto',
  width: '100%',
  maxHeight: 'calc(100vh - 400px)',
  '@media': {
    'screen and (max-width: 768px)': {
      width: '100%',
      maxHeight: 'calc(60vh)',
    },
  },
})

export const imageGridWrapperStyle = style({
  width: 'max-content',
  gridTemplateColumns: 'repeat(3, 1fr)',
  '@media': {
    'screen and (max-width: 1050px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    'screen and (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      margin: '0 auto',
    },
  },
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

const pulse = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0.5 },
})

export const loadingImage = style({
  animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
  backgroundColor: vars.color.background2,
})
