import { skeletonAnimation } from '@buildeross/ui/styles'
import { color, vars } from '@buildeross/zord'
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
  transition: 'background-color 0.12s ease, opacity 0.12s ease, transform 0.12s ease',
  borderRadius: '8px',
  overflow: 'hidden',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.background2,
    },
  },
  '@media': {
    '(hover: none)': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
})

export const profileDaoLinkActive = style({
  backgroundColor: color.neutralHover,
  borderRadius: '8px',
  selectors: {
    '&:hover': {
      backgroundColor: color.neutralHover,
    },
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.neutralHover,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.neutralHover,
    },
  },
})

export const profileHiddenDaoLink = style({
  backgroundColor: color.background2,
  borderRadius: '8px',
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

export const profileDaoListRow = style({
  width: '100%',
  padding: '0',
  borderBottom: `1px solid ${color.border}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
    },
  },
})

export const profileDaoListRowContent = style({
  boxSizing: 'border-box',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  minHeight: '64px',
  gap: '12px',
  padding: '4px',
})

export const daoEditorButtonGroup = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
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
      outline: `3px solid ${color.focusRing}`,
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
  backgroundColor: color.background2,
  color: color.text1,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
  },
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
  width: '32px',
  height: '32px',
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
  minWidth: '240px',
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
  border: 'none',
  backgroundColor: 'transparent',
  color: color.text1,
  textDecoration: 'none',
  font: 'inherit',
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      backgroundColor: color.background2,
    },
    '&:focus-visible': {
      outline: `3px solid ${color.focusRing}`,
      outlineOffset: '2px',
      borderRadius: '6px',
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
  borderRadius: '8px',
  background: 'transparent',
  cursor: 'pointer',
  selectors: {
    '&:focus-visible': {
      zIndex: 3,
      outline: `3px solid ${color.focusRing}`,
      outlineOffset: '2px',
    },
  },
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
    '&:focus-visible': { outline: `3px solid ${color.focusRing}`, outlineOffset: '2px' },
  },
})

export const profilePage = style({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: '1440px',
  margin: '0 auto',
  padding: '24px 16px 56px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  '@media': {
    '(min-width: 768px)': {
      padding: '36px 24px 72px',
      gap: '24px',
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
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  '@media': {
    '(min-width: 1024px)': {
      padding: '10px 16px',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      minHeight: '104px',
    },
  },
})

export const profileHeaderRight = style({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  flex: '0 0 auto',
  width: '100%',
  alignItems: 'stretch',
  '@media': {
    '(min-width: 1024px)': {
      width: 'auto',
      maxWidth: '520px',
      gap: '12px',
      alignSelf: 'center',
    },
  },
})

export const profileHeaderTopRow = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '8px',
  alignItems: 'flex-start',
  flex: '1',
  '@media': {
    '(min-width: 1024px)': {
      flexDirection: 'row',
      alignItems: 'center',
      gap: '12px',
      justifyContent: 'flex-end',
    },
  },
})

export const profileHeaderIdentity = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: '10px',
  '@media': {
    '(min-width: 640px)': {
      gap: '12px',
    },
  },
})

export const profileHeaderIdentityContent = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
})

export const profileHeaderNameRow = style({
  width: '100%',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flexWrap: 'nowrap',
  columnGap: '10px',
  rowGap: '0',
  '@media': {
    '(min-width: 640px)': {
      columnGap: '10px',
      rowGap: '6px',
    },
  },
})

export const profileHeaderCopyRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flex: '0 1 auto',
  minWidth: '74px',
  maxWidth: '48%',
  marginLeft: '0',
  padding: '0',
  borderRadius: '0',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
    },
  },
  '@media': {
    '(min-width: 640px)': {
      flex: '0 1 auto',
      minWidth: 0,
      maxWidth: '100%',
      marginLeft: '0',
    },
  },
})

export const profileIdentityLinks = style({
  marginTop: '0',
})

export const profileSocialIcon = style({
  display: 'block',
  width: '16px',
  height: '16px',
  flexShrink: 0,
  filter: 'invert(1)',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      filter: 'none',
    },
  },
})

export const profileWalletAddress = style({
  flex: '0 1 auto',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'monospace',
  fontSize: '12px',
  lineHeight: 1.2,
  color: color.text2,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text2,
    },
  },
})

export const profileHeaderCopyLinkButton = style({
  minHeight: '30px',
  padding: '5px 10px',
  borderRadius: '999px',
  border: `1px solid ${color.border}`,
  backgroundColor: color.background2,
  color: color.text1,
  fontFamily: 'inherit',
  fontSize: '12px',
  lineHeight: 1.2,
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition:
    'border-color 0.12s ease, background-color 0.12s ease, box-shadow 0.12s ease',
  selectors: {
    '&:hover': {
      backgroundColor: color.neutralHover,
      borderColor: color.text3,
    },
    '&:focus-visible': {
      outline: `2px solid ${color.focusRing}`,
      outlineOffset: '2px',
    },
    '&:disabled': {
      opacity: 0.65,
      cursor: 'not-allowed',
    },
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
    'html[data-theme-mode="dark"] &:hover': {
      backgroundColor: vars.color.neutralHover,
      borderColor: vars.color.text3,
    },
  },
})

export const profileHeaderActions = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  flexShrink: 0,
  minWidth: 0,
  flex: '0 0 auto',
  marginTop: '0',
  marginLeft: '10px',
})

export const profileStats = style({
  width: '100%',
  display: 'grid',
  flex: '0 1 auto',
  gridTemplateColumns: 'repeat(5, minmax(72px, 1fr))',
  gap: '6px',
  overflowX: 'auto',
  '@media': {
    '(min-width: 1024px)': {
      marginLeft: 0,
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    },
    '(min-width: 640px)': {
      gap: '8px',
    },
  },
})

export const profileStat = style({
  minWidth: 0,
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '2px',
  textAlign: 'center',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  minHeight: '48px',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.border,
      backgroundColor: vars.color.background2,
    },
  },
})

export const profileStatPrimary = style({
  gridColumn: '1 / -1',
})

export const profileStatValue = style({
  fontSize: '16px',
  lineHeight: 1,
  fontWeight: 700,
  wordBreak: 'break-word',
})

export const profileStatLabel = style({
  fontSize: '11px',
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  color: color.text3,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
  fontWeight: 600,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text3,
    },
  },
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
  marginBottom: '14px',
})

export const tokenSectionHeaderCollapsed = style({
  paddingTop: '0',
  paddingBottom: '0',
  marginBottom: '14px',
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
      outline: `3px solid ${color.focusRing}`,
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
      outline: `2px solid ${color.focusRing}`,
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
      outline: `3px solid ${color.focusRing}`,
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
  width: 'min(280px, calc(100vw - 80px))',
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

export const profileChainIcon = style({
  display: 'block',
  width: '18px',
  height: '18px',
  objectFit: 'contain',
  borderRadius: '50%',
  backgroundColor: color.background2,
  border: `1px solid ${color.border}`,
  padding: '1px',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
    },
  },
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
  gridTemplateAreas: '"activity" "daos"',
  gap: '24px',
  '@media': {
    '(min-width: 1024px)': {
      gridTemplateColumns: 'minmax(240px, 340px) minmax(0, 1fr)',
      gridTemplateAreas: '"daos activity"',
      alignItems: 'stretch',
    },
  },
})

export const activityGrid = profileDashboardGrid

export const profileDashboardSurface = style({
  gridArea: 'activity',
  '@media': {
    '(min-width: 1024px)': {
      height: '652px',
    },
  },
})

export const profileDaoSurface = style({
  gridArea: 'daos',
  position: 'relative',
  zIndex: 2,
  overflow: 'visible',
})

export const profileDashboardSection = style({
  '@media': {
    '(min-width: 1024px)': {
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
  maxHeight: '324px',
  overflowY: 'auto',
  padding: '2px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'transparent transparent',
  scrollbarGutter: 'stable',
  '@media': {
    '(min-width: 1024px)': {
      flex: 1,
      minHeight: 0,
      maxHeight: 'none',
      overflowY: 'auto',
    },
  },
  selectors: {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '999px',
      border: `2px solid transparent`,
      backgroundClip: 'content-box',
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'transparent',
    },
    '&:hover': {
      scrollbarColor: `${color.text3} transparent`,
    },
    '&:focus-within': {
      scrollbarColor: `${color.text3} transparent`,
    },
    '&:hover::-webkit-scrollbar': {
      width: '6px',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: color.text3,
    },
    '&:hover::-webkit-scrollbar-thumb:hover': {
      backgroundColor: color.text2,
    },
    '&:focus-within::-webkit-scrollbar-thumb': {
      backgroundColor: color.text3,
    },
    '&:focus-within::-webkit-scrollbar-thumb:hover': {
      backgroundColor: color.text2,
    },
  },
})

export const activityViewport = style({
  maxHeight: '548px',
  overflowY: 'auto',
  scrollbarWidth: 'thin',
  scrollbarColor: 'transparent transparent',
  scrollbarGutter: 'stable',
  '@media': {
    '(min-width: 1024px)': {
      flex: 1,
      minHeight: 0,
      maxHeight: 'none',
    },
  },
  selectors: {
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: '999px',
      border: `2px solid transparent`,
      backgroundClip: 'content-box',
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'transparent',
    },
    '&:hover': {
      scrollbarColor: `${color.text3} transparent`,
    },
    '&:focus-within': {
      scrollbarColor: `${color.text3} transparent`,
    },
    '&:hover::-webkit-scrollbar': {
      width: '6px',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: color.text3,
    },
    '&:hover::-webkit-scrollbar-thumb:hover': {
      backgroundColor: color.text2,
    },
    '&:focus-within::-webkit-scrollbar-thumb': {
      backgroundColor: color.text3,
    },
    '&:focus-within::-webkit-scrollbar-thumb:hover': {
      backgroundColor: color.text2,
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

export const activityList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
})

export const activityRow = style({
  minHeight: '64px',
  padding: '4px',
  display: 'grid',
  gridTemplateColumns: '48px minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: '8px',
  rowGap: '2px',
  borderRadius: '8px',
  color: color.text1,
  textDecoration: 'none',
  position: 'relative',
  selectors: {
    '&:hover': { color: color.text1, backgroundColor: color.background2 },
    '&:focus-visible': { outline: `3px solid ${color.focusRing}`, outlineOffset: '2px' },
    '&:last-child': { borderBottom: 'none' },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
      borderColor: vars.color.border,
    },
    'html[data-theme-mode="dark"] &:hover': {
      color: vars.color.text1,
      backgroundColor: vars.color.background2,
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '1px',
      backgroundColor: vars.color.border,
    },
    '&:last-child::after': {
      content: 'none',
    },
  },
  '@media': {
    '(min-width: 640px)': {
      gridTemplateColumns: '48px minmax(0, 1fr) minmax(112px, 32%)',
      gap: '12px',
    },
  },
})

export const activityRowContent = style({
  minWidth: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '1px',
})

export const activityRowTitleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
})

export const activityRowTitle = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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
  flexWrap: 'nowrap',
  gap: '6px',
  whiteSpace: 'nowrap',
})

export const activityVoteSupport = style({
  fontSize: 'inherit',
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
  gridColumn: '3',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '2px',
  color: color.text3,
  fontSize: '12px',
  textAlign: 'right',
  width: 'auto',
  whiteSpace: 'nowrap',
  selectors: {
    'html[data-theme-mode="dark"] &': { color: vars.color.text3 },
  },
  '@media': {
    '(min-width: 640px)': {
      gridColumn: '3',
      textAlign: 'right',
      width: '100%',
    },
  },
})

export const activityDaoNameRow = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
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
  width: '100%',
  marginLeft: '0',
  marginRight: '0',
  paddingLeft: 0,
  paddingRight: 0,
  listStyle: 'none',
  marginTop: 0,
  marginBottom: 0,
  '@media': {
    '(min-width: 640px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    '(min-width: 1024px)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
    '(min-width: 1280px)': { gridTemplateColumns: 'repeat(6, minmax(0, 1fr))' },
    '(min-width: 1440px)': { gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' },
  },
})

export const tokenGalleryToggle = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0',
  padding: '0',
  cursor: 'pointer',
  minHeight: '32px',
  flexShrink: 0,
  width: '32px',
  height: '32px',
  border: 'none',
  backgroundColor: 'transparent',
  color: color.text2,
  selectors: {
    '&:hover': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    '&:focus': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    '&:active': {
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
    '&:focus-visible': {
      outline: `2px solid ${color.focusRing}`,
      outlineOffset: '2px',
    },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text2,
    },
    'html[data-theme-mode="dark"] &:hover': {
      color: vars.color.text1,
    },
  },
})

export const tokenGalleryToggleIcon = style({
  width: '20px',
  height: '20px',
})

export const activityDaoNameText = style({
  display: 'none',
  '@media': {
    '(min-width: 640px)': {
      display: 'inline',
    },
  },
})

export const tokenGalleryHeaderLeft = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
})

export const tokenGalleryHeaderRight = style({
  marginLeft: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
})

export const tokenGalleryBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

export const tokenGridItem = style({
  position: 'relative',
  display: 'flex',
  minWidth: 0,
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
      outline: `3px solid ${color.focusRing}`,
      outlineOffset: '3px',
    },
  },
})

export const tokenCard = style({
  minWidth: 0,
  position: 'relative',
  width: '100%',
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
    '&:focus-visible': { outline: `3px solid ${color.focusRing}`, outlineOffset: '2px' },
    'html[data-theme-mode="dark"] &': {
      color: vars.color.text1,
      borderColor: vars.color.border,
      backgroundColor: vars.color.background2,
    },
  },
})

export const tokenCardImage = style({
  position: 'relative',
  aspectRatio: '1 / 1',
  width: '100%',
  overflow: 'hidden',
})

export const tokenCardIdBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 6px',
  border: `1px solid ${color.border}`,
  borderRadius: '999px',
  backgroundColor: color.background1,
  color: color.text2,
  fontSize: '11px',
  lineHeight: 1.1,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
      color: vars.color.text2,
    },
  },
})

export const tokenCardChainBadge = style({
  position: 'absolute',
  top: '6px',
  right: '6px',
  zIndex: 2,
  opacity: 0,
  transform: 'scale(0.95)',
  transition: 'opacity 0.15s ease, transform 0.15s ease',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  selectors: {
    [`${tokenCard}:hover &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
    [`${tokenCard}:focus-visible &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
  '@media': {
    '(hover: none)': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
})

export const tokenCardSelected = style({
  borderColor: color.focusRing,
  boxShadow: `0 0 0 2px ${color.focusRing}`,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.focusRing,
      boxShadow: `0 0 0 2px ${vars.color.focusRing}`,
    },
  },
})

export const tokenCardSelectionBadge = style({
  position: 'absolute',
  top: '6px',
  left: '6px',
  zIndex: 3,
  width: '24px',
  height: '24px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  backgroundColor: color.background1,
  border: `1px solid ${color.border}`,
  color: color.text2,
  opacity: 0,
  transform: 'scale(0.95)',
  transition: 'opacity 0.15s ease, transform 0.15s ease',
  selectors: {
    [`${tokenCard}:hover &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
    [`${tokenCard}:focus-visible &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
    [`${tokenCard}:active &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
      color: vars.color.text2,
    },
  },
  '@media': {
    '(hover: none)': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
})

export const tokenCardSelectionButton = style({
  padding: 0,
  font: 'inherit',
  cursor: 'pointer',
  selectors: {
    [`${tokenGridItem}:hover &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
    [`${tokenGridItem}:focus-within &`]: {
      opacity: 1,
      transform: 'scale(1)',
    },
  },
})

export const tokenCardSelectionBadgeActive = style({
  backgroundColor: color.focusRing,
  borderColor: color.focusRing,
  color: color.background1,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.focusRing,
      borderColor: vars.color.focusRing,
      color: vars.color.background1,
    },
  },
})

export const profileHeaderDisplayName = style({
  minWidth: 0,
  flex: '0 1 auto',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const tokenCardChainBadgeLogo = style({
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
})

export const profileChainIconNoBackground = style({
  backgroundColor: 'transparent',
  border: 'none',
  padding: 0,
  borderRadius: '999px',
})

export const profileChainFallbackNoBackground = style({
  backgroundColor: 'transparent',
  border: 'none',
  borderRadius: '999px',
})

export const tokenCardBody = style({
  position: 'absolute',
  left: '-1px',
  right: '-1px',
  bottom: '-1px',
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  pointerEvents: 'none',
  opacity: 0,
  visibility: 'hidden',
  transform: 'translateY(100%)',
  transition: 'opacity 0.15s ease, transform 0.15s ease',
  backgroundColor: color.background2,
  borderRadius: '0 0 8px 8px',
  color: color.text1,
  selectors: {
    [`${tokenCard}:hover &`]: {
      opacity: 1,
      transform: 'translateY(0)',
      pointerEvents: 'auto',
      visibility: 'visible',
    },
    [`${tokenCard}:focus-visible &`]: {
      opacity: 1,
      transform: 'translateY(0)',
      pointerEvents: 'auto',
      visibility: 'visible',
    },
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      color: vars.color.text1,
    },
  },
  '@media': {
    '(hover: none)': {
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0)',
      pointerEvents: 'auto',
    },
  },
})

export const tokenCardMeta = style({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  marginTop: 0,
})

export const tokenTransferTray = style({
  position: 'fixed',
  left: '12px',
  right: '12px',
  bottom: '12px',
  zIndex: 110,
  maxWidth: '760px',
  margin: '0 auto',
  padding: '14px',
  border: `1px solid ${color.border}`,
  borderRadius: '10px',
  backgroundColor: color.background1,
  boxShadow: '0 18px 44px rgba(0, 0, 0, 0.2)',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
  },
})

export const tokenTransferTrayRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  flexWrap: 'wrap',
})

export const tokenTransferInput = style({
  flex: '1 1 220px',
  minHeight: '40px',
  padding: '0 12px',
  border: `1px solid ${color.border}`,
  borderRadius: '8px',
  backgroundColor: color.background2,
  color: color.text1,
  fontSize: '14px',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${color.focusRing}`,
      outlineOffset: '2px',
    },
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background2,
      borderColor: vars.color.border,
      color: vars.color.text1,
    },
  },
})

export const tokenTransferBackButton = style({
  border: `1px solid ${color.text1}`,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.text1,
    },
  },
})

export const tokenTransferReview = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '10px',
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

export const tokenTransferPreviewGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, 36px)',
  gap: '6px',
  alignItems: 'center',
})

export const tokenTransferPreview = style({
  position: 'relative',
  width: '36px',
  height: '36px',
  overflow: 'hidden',
  border: `1px solid ${color.border}`,
  borderRadius: '6px',
  backgroundColor: color.background1,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      backgroundColor: vars.color.background1,
      borderColor: vars.color.border,
    },
  },
})

export const tokenTransferWarning = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  padding: '10px',
  border: `1px solid ${color.negative}`,
  borderRadius: '8px',
  color: color.text1,
  selectors: {
    'html[data-theme-mode="dark"] &': {
      borderColor: vars.color.negative,
      color: vars.color.text1,
    },
  },
})

export const profileStatBadge = style({
  fontSize: '12px',
  lineHeight: 1,
  padding: '3px 6px',
})
