import * as z from '@buildeross/constants/layers'
import { style, styleVariants } from '@vanilla-extract/css'

export const animatedModal = style({
  position: 'fixed',
  background: 'rgba(0, 0, 0, 0.17)',
  height: '100vh',
  top: 0,
  left: 0,
  width: '100vw',
  zIndex: z.MODAL_BACKDROP_LAYER,
})

export const animatedModalTrigger = style({
  selectors: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

export const defaultAnimatedModalContent = style({
  background: '#fff',
  maxWidth: 'calc(100vw - 50px)',
  height: 'auto',
  maxHeight: '90vh',
  zIndex: z.MODAL_CONTENT_LAYER,
  '@media': {
    'screen and (max-width: 768px)': {
      width: 'calc(100% - 50px)',
      left: 25,
      top: 25,
    },
  },
})

export const smallAnimatedContent = style({
  position: 'fixed',
  left: '50%',
  marginLeft: '-224px !important',
  width: 448,
  top: 120,
  gap: 24,
  padding: 32,
  borderRadius: 12,
  '@media': {
    'screen and (max-width: 768px)': {
      width: 'calc(100% - 50px)',
      left: 25,
      marginLeft: '0 !important',
    },
  },
})

export const mediumAnimatedContent = style({
  position: 'fixed',
  left: '50%',
  marginLeft: '-340px !important',
  width: 680,
  top: 120,
  gap: 24,
  padding: 32,
  borderRadius: 12,
  '@media': {
    'screen and (max-width: 768px)': {
      width: 'calc(100% - 50px)',
      left: 25,
      marginLeft: '0 !important',
    },
  },
})

export const largeAnimatedContent = style({
  position: 'fixed',
  left: '50%',
  marginLeft: '-456px !important',
  width: 912,
  top: 120,
  gap: 24,
  padding: 32,
  borderRadius: 12,
  '@media': {
    'screen and (max-width: 1000px)': {
      width: 'calc(100% - 50px)',
      left: 25,
      marginLeft: '0 !important',
    },
    'screen and (max-width: 768px)': {
      width: 'calc(100% - 50px)',
      left: 25,
      marginLeft: '0 !important',
    },
  },
})

export const animatedModalContent = styleVariants({
  small: [defaultAnimatedModalContent, smallAnimatedContent],
  medium: [defaultAnimatedModalContent, mediumAnimatedContent],
  large: [defaultAnimatedModalContent, largeAnimatedContent],
  auto: [
    defaultAnimatedModalContent,
    smallAnimatedContent,
    { marginLeft: '-340px !important', width: '680px !important', height: 'auto' },
  ],
})
