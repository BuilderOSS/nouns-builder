import { skeletonAnimation } from '@buildeross/ui/styles'
import { color, vars } from '@buildeross/zord'
import { globalStyle, style } from '@vanilla-extract/css'

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

export const profileContentColumn = style({
  width: '100%',
  maxWidth: '100%',
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
  cursor: 'pointer',
  transition:
    'border-color 0.12s ease, background-color 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease, transform 0.12s ease',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.background2,
    },
  },
})

export const profileDaoLinkActive = style({
  borderColor: '#000',
  boxShadow: '0 0 0 1px #000',
  selectors: {
    '&:hover': {
      borderColor: '#000',
    },
    'html[data-theme-mode="dark"] &': {
      borderColor: '#fff',
      boxShadow: '0 0 0 1px #fff',
    },
    'html[data-theme-mode="dark"] &:hover': {
      borderColor: '#fff',
    },
  },
})

export const profileHiddenDaoLink = style({
  backgroundColor: color.background2,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.backdrop,
    },
    '&:hover': {
      backgroundColor: color.neutralHover,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.neutralHover,
    },
  },
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

export const daoEditorButtonGroupDragging = style({
  pointerEvents: 'none',
})

export const daoEditorIconButton = style({
  minWidth: '28px',
  width: '28px',
  height: '28px',
  padding: '0',
  selectors: {
    '&[disabled]': {
      cursor: 'inherit',
    },
  },
})

export const daoEditorDragHandle = style({
  cursor: 'grab',
  touchAction: 'none',
})

export const daoEditorDragHandleActive = style({
  cursor: 'grabbing',
})

export const daoEditorDragging = style({
  border: `2px solid ${color.positive}`,
  cursor: 'grabbing',
  position: 'relative',
})

export const daoEditorSpacer = style({
  height: '0',
  transition: 'height 0.12s ease-out, margin 0.12s ease-out',
})

export const daoEditorSpacerActive = style({
  height: '34px',
  marginBottom: '10px',
  borderRadius: '10px',
  border: `2px dashed ${color.positive}`,
  backgroundColor: color.positiveDisabled,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const daoEditorSpacerLabel = style({
  fontSize: '12px',
  fontWeight: 700,
  color: color.positiveActive,
})

export const filterBar = style({
  width: '100%',
  marginBottom: '24px',
  padding: '16px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
  },
})

export const filterControl = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: 'auto',
  '@media': {
    '(max-width: 767px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
      width: '100%',
    },
  },
})

export const filterLabel = style({
  color: color.text3,
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
})

export const filterSelect = style({
  appearance: 'none',
  width: '300px',
  minHeight: '40px',
  padding: '0 36px 0 12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  color: color.text1,
  fontSize: '14px',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
  },
  '@media': {
    '(max-width: 767px)': {
      width: '100%',
    },
  },
})

export const filterSelectWrapper = style({
  position: 'relative',
  width: '300px',
  '@media': {
    '(max-width: 767px)': {
      width: '100%',
    },
  },
})

export const filterDropdownIcon = style({
  position: 'absolute',
  top: '50%',
  right: '8px',
  width: '24px',
  height: '24px',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
})

export const activityTypeDropdown = style({
  position: 'relative',
  width: '300px',
  '@media': {
    '(max-width: 767px)': {
      width: '100%',
    },
  },
})

export const activityTypeDropdownButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%',
  minHeight: '40px',
  padding: '0 8px 0 12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  color: color.text1,
  cursor: 'pointer',
  fontSize: '14px',
  textAlign: 'left',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
  },
})

export const activityTypeDropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  maxHeight: '320px',
  overflowY: 'auto',
  padding: '6px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  boxShadow: '0 18px 44px rgba(0, 0, 0, 0.18)',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
  },
})

export const activityTypeDropdownOption = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '36px',
  padding: '8px 10px',
  borderRadius: '6px',
  color: color.text1,
  cursor: 'pointer',
  fontSize: '14px',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
    },
  },
})

export const filterSummaryChip = style({
  padding: '6px 10px',
  borderRadius: '999px',
  backgroundColor: color.background2,
  color: color.text2,
  fontSize: '12px',
  fontWeight: 700,
  whiteSpace: 'nowrap',
})

export const filterCheckboxGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '8px',
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
})

export const filterCheckboxItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '36px',
  padding: '8px 10px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  cursor: 'pointer',
})

export const filterHeader = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%',
  flexWrap: 'wrap',
})

export const filterRightControls = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'flex-end',
  gap: '12px',
  flex: '0 0 auto',
  flexWrap: 'nowrap',
  marginLeft: 'auto',
  '@media': {
    '(max-width: 767px)': {
      width: '100%',
      flexWrap: 'wrap',
      marginLeft: 0,
    },
  },
})

export const activeDaoFilterChip = style({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '40px',
  padding: '0 12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  color: color.text2,
  fontSize: '14px',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text2,
    },
  },
})

export const activeDaoFilterHelp = style({
  position: 'relative',
  display: 'inline-flex',
  outline: 'none',
  selectors: {
    '&:hover::after, &:focus::after, &:focus-within::after': {
      content: '"Select DAOs from the sidebar to filter this profile activity by DAO."',
      position: 'absolute',
      left: 0,
      top: 'calc(100% + 8px)',
      zIndex: 40,
      width: '260px',
      padding: '8px 10px',
      border: `1px solid ${color.border}`,
      borderRadius: '8px',
      backgroundColor: color.background1,
      color: color.text1,
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.4,
      textTransform: 'none',
      whiteSpace: 'normal',
    },
    'html[data-theme-mode="dark"] &:hover::after, html[data-theme-mode="dark"] &:focus::after, html[data-theme-mode="dark"] &:focus-within::after':
      {
        backgroundColor: vars.color.background1,
        borderColor: vars.color.border,
        color: vars.color.text1,
      },
  },
})

export const delegateModalSection = style({
  width: '100%',
  padding: '16px',
  border: `1px solid ${color.border}`,
  borderRadius: '10px',
  backgroundColor: '#f2f2f2',
  color: '#000',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: '#f2f2f2',
      borderColor: '#d8d8d8',
      color: '#000',
    },
  },
})

globalStyle(`${delegateModalSection} *`, {
  color: '#000',
})

export const profileLinkEditInput = style({
  width: '100%',
  minHeight: '40px',
  marginTop: '8px',
  padding: '0 12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: '#fff',
  color: '#000',
  fontSize: '14px',
})

export const walletScannerMenuRoot = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
})

export const walletScannerMenuCheckbox = style({
  position: 'absolute',
  inset: 0,
  zIndex: 2,
  width: '28px',
  height: '28px',
  margin: 0,
  opacity: 0.01,
  cursor: 'pointer',
})

export const walletScannerMenuButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  padding: 0,
  border: 'none',
  borderRadius: '6px',
  backgroundColor: 'transparent',
  color: color.text2,
  cursor: 'pointer',
  pointerEvents: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
      color: color.text1,
    },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text2,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
      color: vars.color.text1,
    },
    [`${walletScannerMenuCheckbox}:focus-visible + &`]: {
      boxShadow: `0 0 0 2px ${color.accent}`,
    },
  },
})

export const walletScannerMenu = style({
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  zIndex: 30,
  display: 'none',
  minWidth: '190px',
  padding: '6px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  boxShadow: '0 18px 44px rgba(0, 0, 0, 0.18)',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
    [`${walletScannerMenuRoot}:hover &`]: {
      display: 'block',
    },
    [`${walletScannerMenuRoot}:focus-within &`]: {
      display: 'block',
    },
    [`${walletScannerMenuCheckbox}:checked ~ &`]: {
      display: 'block',
    },
  },
})

export const walletScannerMenuItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  color: color.text1,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
    },
  },
})

export const delegateDaoDropdown = style({
  position: 'relative',
  width: '100%',
})

export const delegateDaoDropdownButton = style({
  width: '100%',
  padding: '12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  color: color.text1,
  cursor: 'pointer',
  textAlign: 'left',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
  },
})

export const delegateDaoDropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: 20,
  maxHeight: '280px',
  overflowY: 'auto',
  padding: '6px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  boxShadow: '0 18px 44px rgba(0, 0, 0, 0.18)',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
  },
})

export const delegateDaoButton = style({
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: 'transparent',
  color: color.text1,
  cursor: 'pointer',
  textAlign: 'left',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
    },
  },
})

export const delegateDaoButtonActive = style({
  backgroundColor: color.background2,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
    },
  },
})

export const delegateDaoImage = style({
  width: '32px',
  height: '32px',
  borderRadius: '4px',
  objectFit: 'cover',
  flexShrink: 0,
})

export const delegateDaoMeta = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
  flex: 1,
})

export const profileDaoFilterButton = style({
  display: 'block',
  width: '100%',
  padding: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  textAlign: 'inherit',
  cursor: 'pointer',
})

export const profileStatBadge = style({
  fontSize: '12px',
  lineHeight: 1,
  padding: '3px 6px',
})
