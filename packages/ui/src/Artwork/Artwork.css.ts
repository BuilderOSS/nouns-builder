import { atoms, vars } from '@buildeross/zord'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

export const artworkSettingsBox = style({
  border: `2px solid ${vars.color.border}`,
  borderRadius: '10px',
})

export const artworkSettingsBoxDragging = style({
  opacity: 0.45,
  borderColor: vars.color.positive,
})

export const artworkSettingsDropSpacer = style({
  height: '0',
  transition: 'height 0.12s ease-out, margin 0.12s ease-out',
})

export const artworkSettingsDropSpacerActive = style({
  height: '36px',
  marginBottom: '12px',
  borderRadius: '10px',
  border: `2px dashed ${vars.color.positive}`,
  backgroundColor: vars.color.positiveDisabled,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const artworkSettingsDropLabel = style({
  color: vars.color.positiveActive,
  fontWeight: 700,
  fontSize: '13px',
})

export const artworkSettingsName = style({
  color: vars.color.text2,
  fontWeight: 700,
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const artworkSettingsDragHandle = style({
  cursor: 'grab',
  touchAction: 'none',
})

export const artworkSettingsDragHandleActive = style({
  cursor: 'grabbing',
})

export const artworkSettingsPropertyName = style({
  height: 50,
  width: '100%',
  backgroundColor: vars.color.background2,
  borderRadius: '15px',
  fontSize: 16,
  paddingLeft: 24,
  boxSizing: 'border-box',
  border: `2px solid ${vars.color.background1}`,
  color: vars.color.text3,
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
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
  border: `2px solid ${vars.color.background1}`,
  maxWidth: '100px',
  selectors: {
    '&:focus': {
      outline: 'none',
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
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
    background: vars.color.background2,
    border: 0,
    borderRadius: '12px',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
  },
])

globalStyle(`html[data-theme-mode='dark'] ${layerSelectStyle}`, {
  color: `${vars.color.text1} !important`,
})

globalStyle(`html[data-theme-mode='dark'] ${layerSelectStyle}:focus-visible`, {
  color: `${vars.color.text1} !important`,
  outline: `2px solid ${vars.color.text1}`,
  outlineOffset: '2px',
})

globalStyle(`html[data-theme-mode='dark'] ${layerSelectStyle} option`, {
  color: `${vars.color.text1} !important`,
})

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
    color: vars.color.text3,
    opacity: 0.6,
    fontWeight: 400,
    // top: '28%',
  },
])

globalStyle(`html[data-theme-mode='dark'] ${selectTraitNameStyle}`, {
  color: `${vars.color.text1} !important`,
})

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
  boxShadow: `2px 2px 2px ${vars.color.backdrop}`,
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
    borderRight: `2px solid ${vars.color.background2}`,
    background: vars.color.background1,
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
  background: vars.color.background2,
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
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.background2,
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
