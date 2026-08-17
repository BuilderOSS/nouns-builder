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

export const compactFilterControl = style({
  width: '100%',
  minHeight: '40px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  color: color.text1,
  cursor: 'pointer',
  fontSize: '14px',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${color.positive}`,
      outlineOffset: '2px',
    },
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
  },
})

export const activityTypeDropdownButton = style([
  compactFilterControl,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 8px 0 12px',
    textAlign: 'left',
  },
])

export const compactFilterSelect = style([
  compactFilterControl,
  {
    appearance: 'none',
    padding: '0 36px 0 12px',
  },
])

export const compactFilterChevron = style({
  position: 'absolute',
  top: '50%',
  right: '8px',
  display: 'flex',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
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

export const activityKindDropdown = style({
  position: 'relative',
  width: '144px',
})

export const activityKindDropdownMenu = style({
  right: 0,
  left: 'auto',
  minWidth: '190px',
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
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${color.accent}`,
    },
  },
})

export const walletScannerMenu = style({
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  zIndex: 100,
  display: 'block',
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
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  padding: 0,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
})

export const profileDaoFilterContainer = style({
  position: 'relative',
  width: '100%',
})

export const profileDaoFilterContent = style({
  position: 'relative',
  zIndex: 1,
  pointerEvents: 'none',
})

export const profileDaoNameLink = style({
  position: 'relative',
  zIndex: 2,
  minWidth: 0,
  color: 'inherit',
  textDecoration: 'none',
  pointerEvents: 'auto',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
    '&:focus-visible': { outline: `3px solid ${color.positive}`, outlineOffset: '2px' },
  },
})

export const profilePage = style({
  width: '100%',
  maxWidth: '1440px',
  margin: '0 auto',
  padding: '32px 16px 64px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  '@media': {
    '(min-width: 768px)': {
      padding: '48px 32px 80px',
      gap: '32px',
    },
  },
})

export const profileSurface = style({
  width: '100%',
  border: `1px solid ${color.border}`,
  borderRadius: '12px',
  backgroundColor: color.background1,
  overflow: 'hidden',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
  },
})

export const profileHeaderSurface = style({
  position: 'relative',
  zIndex: 10,
  overflow: 'visible',
})

export const profileHeaderMain = style({
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  '@media': {
    '(min-width: 768px)': {
      padding: '32px',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
  },
})

export const profileHeaderIdentity = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  '@media': {
    '(min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  },
})

export const profileHeaderNameRow = style({
  width: '100%',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  columnGap: '16px',
  rowGap: '12px',
})

export const profileHeaderCopyRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '0 1 460px',
  minWidth: 0,
  maxWidth: '100%',
  padding: '6px 10px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
    },
  },
})

export const profileWalletAddress = style({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'monospace',
  fontSize: '13px',
})

export const profileHeaderActions = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  flexShrink: 0,
})

export const profileStats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  borderTop: `1px solid ${color.border}`,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    },
  },
})

export const profileStat = style({
  minHeight: '96px',
  padding: '16px 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  textAlign: 'center',
  borderRight: `1px solid ${color.border}`,
  borderBottom: `1px solid ${color.border}`,
  selectors: {
    '&:first-child': {
      gridColumn: '1 / -1',
    },
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      borderBottom: 0,
      selectors: {
        '&:first-child': {
          gridColumn: 'auto',
        },
      },
    },
  },
})

export const profileStatValue = style({
  fontSize: '28px',
  lineHeight: 1,
  fontWeight: 700,
})

export const profileSection = style({
  padding: '20px',
  '@media': {
    '(min-width: 768px)': {
      padding: '24px',
    },
  },
})

export const profileSectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
  marginBottom: '20px',
})

export const daoSelectorList = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '8px',
  padding: '2px',
  '@media': {
    '(min-width: 640px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    '(min-width: 768px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
    '(min-width: 1200px)': {
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    },
  },
})

export const daoSelectorCard = style({
  position: 'relative',
  minWidth: 0,
  minHeight: '60px',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: color.text1,
  backgroundColor: color.background2,
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  textAlign: 'left',
  transition: 'border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease',
  selectors: {
    '&:hover': { borderColor: color.text3 },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
    },
  },
})

export const daoSelectorFilterButton = style({
  position: 'absolute',
  inset: 0,
  zIndex: 0,
  border: 0,
  borderRadius: '8px',
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${color.positive}`,
      outlineOffset: '2px',
    },
  },
})

export const daoSelectorCardAvatar = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexShrink: 0,
  pointerEvents: 'none',
})

export const daoSelectorNameLink = style({
  position: 'relative',
  zIndex: 2,
  minWidth: 0,
  flex: 1,
  color: 'inherit',
  textDecoration: 'none',
  selectors: {
    '&:hover': { textDecoration: 'underline' },
    '&:focus-visible': {
      outline: `2px solid ${color.positive}`,
      outlineOffset: '2px',
      borderRadius: '2px',
    },
  },
})

export const daoSelectorCardActive = style({
  borderColor: color.text1,
  boxShadow: `0 0 0 2px ${color.text1}`,
  backgroundColor: color.neutralHover,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.text1,
      boxShadow: `0 0 0 2px ${vars.color.text1}`,
      backgroundColor: vars.color.neutralHover,
    },
  },
})

export const daoSelectorCheck = style({
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  zIndex: 1,
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: color.text1,
  color: color.background1,
  pointerEvents: 'none',
})

export const daoSelectorChainBadge = style({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  marginLeft: 'auto',
  pointerEvents: 'none',
})

export const daoSelectorHeaderActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
})

export const daoSelectorInfo = style({
  position: 'relative',
  display: 'inline-flex',
})

export const daoSelectorInfoButton = style({
  width: '28px',
  height: '28px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${color.border}`,
  borderRadius: '50%',
  backgroundColor: color.background2,
  color: color.text2,
  cursor: 'help',
  fontSize: '14px',
  fontWeight: 700,
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${color.positive}`,
      outlineOffset: '2px',
    },
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
      backgroundColor: vars.color.background2,
      color: vars.color.text2,
    },
  },
})

export const daoSelectorInfoTooltip = style({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: '-72px',
  zIndex: 100,
  width: 'min(280px, calc(100vw - 48px))',
  padding: '10px 12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  color: color.text2,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
  fontSize: '13px',
  lineHeight: 1.4,
  opacity: 0,
  visibility: 'hidden',
  pointerEvents: 'none',
  transform: 'translateY(-4px)',
  transition: 'opacity 0.12s ease, transform 0.12s ease, visibility 0.12s ease',
  selectors: {
    [`${daoSelectorInfo}:hover &`]: {
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0)',
    },
    [`${daoSelectorInfo}:focus-within &`]: {
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0)',
    },
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
      backgroundColor: vars.color.background1,
      color: vars.color.text2,
    },
  },
})

export const profileDaoListRoot = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  '@media': {
    '(min-width: 768px)': {
      flex: 1,
      minHeight: 0,
    },
  },
})

export const profileDaoListFooter = style({
  display: 'flex',
  justifyContent: 'center',
  flexShrink: 0,
  marginTop: '16px',
  paddingTop: '16px',
  borderTop: `1px solid ${color.border}`,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
    },
  },
})

export const profileChainIcon = style({
  display: 'block',
  width: '18px',
  height: '18px',
})

export const profileChainFallback = style({
  width: '18px',
  height: '18px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${color.border}`,
  borderRadius: '50%',
  color: color.text3,
  fontSize: '11px',
  fontWeight: 700,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
      color: vars.color.text3,
    },
  },
})

export const profileDashboardGrid = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: '24px',
  '@media': {
    '(min-width: 768px)': {
      gridTemplateColumns: 'minmax(240px, 340px) minmax(0, 1fr)',
      alignItems: 'stretch',
    },
  },
})

export const activityGrid = profileDashboardGrid

export const profileDashboardSurface = style({
  '@media': {
    '(min-width: 768px)': {
      height: '652px',
    },
  },
})

export const profileDaoSurface = style({
  position: 'relative',
  zIndex: 2,
  overflow: 'visible',
})

export const profileDashboardSection = style({
  '@media': {
    '(min-width: 768px)': {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    },
  },
})

export const profileDaoListViewport = style({
  boxSizing: 'border-box',
  width: '100%',
  overflow: 'visible',
  padding: '2px',
  '@media': {
    '(min-width: 768px)': {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      paddingRight: '6px',
    },
  },
})

export const activityViewport = style({
  maxHeight: '548px',
  overflowY: 'auto',
  paddingRight: '6px',
  '@media': {
    '(min-width: 768px)': {
      flex: 1,
      minHeight: 0,
      maxHeight: 'none',
    },
  },
})

export const activityHeaderControls = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '8px',
})

export const activityFilterSelect = style({
  minWidth: '112px',
  height: '36px',
  padding: '0 32px 0 10px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background1,
  color: color.text1,
  fontSize: '14px',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${color.positive}`,
      outlineOffset: '2px',
    },
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
      backgroundColor: vars.color.background1,
      color: vars.color.text1,
    },
  },
})

export const activityList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
})

export const activityRow = style({
  minHeight: '100px',
  padding: '14px',
  display: 'grid',
  gridTemplateColumns: '48px minmax(0, 1fr)',
  alignItems: 'center',
  gap: '12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  color: color.text1,
  textDecoration: 'none',
  backgroundColor: color.background2,
  selectors: {
    '&:hover': { borderColor: color.text3 },
    '&:focus-visible': { outline: `3px solid ${color.positive}`, outlineOffset: '2px' },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
      borderColor: vars.color.border,
      backgroundColor: vars.color.background2,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      gridTemplateColumns: '48px minmax(0, 1fr) minmax(112px, 32%)',
    },
  },
})

export const activityRowContent = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const activityBadge = style({
  width: 'fit-content',
  padding: '3px 7px',
  borderRadius: '999px',
  backgroundColor: color.background1,
  color: color.text2,
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      color: vars.color.text2,
    },
  },
})

export const activityBadgeRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '6px',
})

export const activityVoteSupport = style({
  fontSize: '12px',
  fontWeight: 700,
})

export const activityVoteFor = style({
  color: color.positiveActive,
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.positive },
  },
})

export const activityVoteAgainst = style({
  color: color.negativeActive,
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.negative },
  },
})

export const activityVoteAbstain = style({
  color: color.warningStrong,
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.warning },
  },
})

export const activityMeta = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '6px',
  color: color.text3,
  fontSize: '12px',
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.text3 },
  },
})

export const activityDaoMeta = style({
  gridColumn: '2',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  color: color.text3,
  fontSize: '12px',
  textAlign: 'left',
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.text3 },
  },
  '@media': {
    '(min-width: 640px)': {
      gridColumn: '3',
      alignItems: 'flex-end',
      textAlign: 'right',
    },
  },
})

export const activityDaoNameRow = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: color.text2,
  fontWeight: 600,
  overflowWrap: 'anywhere',
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.text2 },
  },
})

export const profileNotice = style({
  padding: '12px',
  marginBottom: '12px',
  borderRadius: '8px',
  backgroundColor: color.background2,
  color: color.text2,
  fontSize: '13px',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      color: vars.color.text2,
    },
  },
})

export const profileEmptyState = style({
  minHeight: '180px',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textAlign: 'center',
  border: `1px dashed ${color.border}`,
  borderRadius: '8px',
  selectors: {
    'html[data-theme-mode="dark"] &': { borderColor: vars.color.border },
  },
})

export const tokenGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px',
  '@media': {
    '(min-width: 640px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    '(min-width: 1024px)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
    '(min-width: 1280px)': { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
    '(min-width: 1440px)': { gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' },
  },
})

export const tokenGridViewport = style({
  width: '100%',
})

export const tokenGridViewportLocked = style({
  overflowX: 'hidden',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  paddingRight: '6px',
  scrollbarGutter: 'stable',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${color.positive}`,
      outlineOffset: '3px',
    },
  },
})

export const tokenCard = style({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  color: color.text1,
  textDecoration: 'none',
  backgroundColor: color.background2,
  transition: 'border-color 0.12s ease, transform 0.12s ease',
  selectors: {
    '&:hover': { borderColor: color.text3, transform: 'translateY(-2px)' },
    '&:focus-visible': { outline: `3px solid ${color.positive}`, outlineOffset: '2px' },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
      borderColor: vars.color.border,
      backgroundColor: vars.color.background2,
    },
  },
})

export const tokenCardBody = style({
  flex: 1,
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

export const tokenCardMeta = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  marginTop: 'auto',
})

export const profileStatBadge = style({
  fontSize: '12px',
  lineHeight: 1,
  padding: '3px 6px',
})
