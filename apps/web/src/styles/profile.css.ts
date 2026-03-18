import { skeletonAnimation } from '@buildeross/ui/styles'
import { color } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

export const loadingSkeleton = style({
  animation: skeletonAnimation,
})

export const daosContainer = style({
  width: '100%',
  '@media': {
    'screen and (min-width: 768px)': {
      width: '360px',
      flexShrink: 0,
      overflow: 'auto',
    },
  },
})

export const tokenContainer = style({
  width: '100%',
  overflow: 'auto',
  '@media': {
    'screen and (min-width: 768px)': {
      flex: 1,
      overflowY: 'auto',
      height: '100%',
    },
  },
})

export const noTokensContainer = style({
  height: '40vh',
  '@media': {
    'screen and (min-width: 768px)': {
      height: '65vh',
    },
  },
})

export const responsiveGrid = style({
  gridTemplateColumns: '1fr',
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: '1fr 1fr',
    },
    '(min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr 1fr',
    },
  },
})

export const profileDaoLink = style({
  backgroundColor: color.background1,
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
  },
})

export const profileHiddenDaoLink = style({
  backgroundColor: color.background2,
})

export const daoEditorRow = style({
  width: '100%',
})

export const daoEditorButtonGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
})

export const daoEditorIconButton = style({
  minWidth: '28px',
  width: '28px',
  height: '28px',
  padding: '0',
})

export const daoEditorDragHandle = style({
  cursor: 'grab',
  selectors: {
    '&:active': {
      cursor: 'grabbing',
    },
  },
})

export const daoEditorDragging = style({
  position: 'relative',
})

export const daoEditorSpacer = style({
  height: '0',
  transition: 'height 0.12s ease-out',
})

export const daoEditorSpacerActive = style({
  height: '18px',
})

export const daoEditorDoneButton = style({
  borderColor: '#2563eb',
  color: '#2563eb',
  backgroundColor: 'rgba(37, 99, 235, 0.06)',
  selectors: {
    '&:hover': {
      borderColor: '#1d4ed8',
      color: '#1d4ed8',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
    },
  },
})

export const daoVisibilityToggleButton = style({
  minHeight: '20px',
  fontSize: '11px',
  padding: '2px 6px',
  alignSelf: 'center',
})
