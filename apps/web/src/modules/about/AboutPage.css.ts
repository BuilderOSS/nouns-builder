import { theme } from '@buildeross/zord'
import { globalStyle, keyframes, style } from '@vanilla-extract/css'

const focusRing = {
  outline: `2px solid ${theme.colors.focusRing}`,
  outlineOffset: '2px',
}

const standardBorder = `2px solid ${theme.colors.border}`
const standardBorderThin = `1px solid ${theme.colors.border}`
const softBlueBackground = `color-mix(in srgb, ${theme.colors.focusRing} 14%, ${theme.colors.background1})`
const softBlueBorder = theme.colors.focusRing

const marqueeScroll = keyframes({
  '0%': {
    transform: 'translateX(0)',
  },
  '100%': {
    transform: 'translateX(-50%)',
  },
})

export const page = style({
  width: '100%',
  padding: '48px 16px 96px',
  boxSizing: 'border-box',
  background: theme.colors.background1,
  overflowX: 'clip',
  '@media': {
    'screen and (min-width: 768px)': {
      padding: '64px 24px 120px',
    },
  },
})

export const container = style({
  maxWidth: '1180px',
  margin: '0 auto',
  width: '100%',
  minWidth: 0,
})

export const centeredImageWrap = style({
  display: 'flex',
  justifyContent: 'center',
})

export const centeredImage = style({
  width: '280px',
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
  selectors: {
    'html[data-theme-mode="dark"] &': {
      filter: 'invert(1)',
    },
  },
})

export const heroVennWrap = style({
  width: '100%',
  height: '100%',
  minHeight: '220px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px',
})

export const heroVennImage = style({
  width: '100%',
  maxWidth: '260px',
  height: 'auto',
  display: 'block',
})

const darkModeSelector = 'html[data-theme-mode="dark"] &'

export const aboutLightOnly = style({
  display: 'block !important',
  selectors: {
    [darkModeSelector]: {
      display: 'none !important',
    },
  },
})

export const aboutDarkOnly = style({
  display: 'none !important',
  selectors: {
    [darkModeSelector]: {
      display: 'block !important',
    },
  },
})

export const section = style({
  marginTop: '72px',
  '@media': {
    'screen and (min-width: 768px)': {
      marginTop: '96px',
    },
  },
})

export const sectionHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '28px',
  maxWidth: '720px',
})

export const eyebrow = style({
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: '999px',
  padding: '4px 10px',
  background: theme.colors.background2,
  border: standardBorderThin,
  fontSize: '12px',
  lineHeight: '16px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: theme.colors.text3,
  fontWeight: 700,
})

export const sectionTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '28px',
  lineHeight: 1.04,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  color: theme.colors.text1,
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '40px',
      whiteSpace: 'nowrap',
      overflowWrap: 'normal',
    },
  },
})

export const sectionTitleOnly = style({
  marginBottom: '12px',
})

export const sectionCopy = style({
  fontSize: '16px',
  lineHeight: 1.55,
  color: theme.colors.text3,
})

export const introCopyNoWrap = style({
  fontSize: '16px',
  lineHeight: 1.55,
  color: theme.colors.text3,
  whiteSpace: 'normal',
  '@media': {
    'screen and (min-width: 960px)': {
      whiteSpace: 'nowrap',
    },
  },
})

export const hero = style({
  display: 'grid',
  gap: '28px',
  alignItems: 'stretch',
  '@media': {
    'screen and (min-width: 980px)': {
      gridTemplateColumns: 'minmax(0, 1.1fr) minmax(360px, 0.9fr)',
      gap: '40px',
    },
  },
})

export const heroCopy = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingTop: '8px',
  minWidth: 0,
})

export const heroTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '36px',
  lineHeight: 1,
  letterSpacing: '-0.03em',
  color: theme.colors.text1,
  maxWidth: '760px',
  overflowWrap: 'anywhere',
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '52px',
    },
  },
})

export const heroText = style({
  maxWidth: '640px',
  fontSize: '16px',
  lineHeight: 1.6,
  color: theme.colors.text3,
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '18px',
      lineHeight: 1.65,
    },
  },
})

export const heroHighlightList = style({
  display: 'grid',
  gap: '10px',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  marginTop: '-4px',
})

export const heroHighlight = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  fontSize: '14px',
  lineHeight: 1.5,
  color: theme.colors.text2,
})

export const heroHighlightDot = style({
  width: '8px',
  height: '8px',
  borderRadius: '999px',
  background: theme.colors.text1,
  flexShrink: 0,
  marginTop: '6px',
})

export const heroActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'stretch',
  '@media': {
    'screen and (min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
})

export const heroPanel = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '16px',
  border: standardBorder,
  background: theme.colors.background2,
  padding: '14px',
  minHeight: 'auto',
  boxShadow: 'none',
  '@media': {
    'screen and (min-width: 768px)': {
      padding: '16px',
      minHeight: '420px',
    },
  },
})

export const heroPanelGlow = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background: 'transparent',
})

export const montageGrid = style({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: '1fr',
  gridTemplateAreas: '"primary" "side" "footer"',
  '@media': {
    'screen and (min-width: 541px)': {
      gridTemplateColumns: '1.05fr 0.95fr',
      gridTemplateAreas: '"primary side" "footer footer"',
    },
  },
})

export const montageCard = style({
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '16px',
  boxShadow: 'none',
  minWidth: 0,
})

export const montagePrimary = style({
  gridArea: 'primary',
  minHeight: 'unset',
})

export const montageSide = style({
  gridArea: 'side',
  minHeight: '180px',
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '220px',
    },
  },
})

export const montageSecondary = style({
  gridArea: 'secondary',
  minHeight: '150px',
})

export const montageFooter = style({
  gridArea: 'footer',
  minHeight: '120px',
  padding: '10px',
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '180px',
    },
  },
})

export const logoMarquee = style({
  width: '100%',
  height: '100%',
  minHeight: '96px',
  overflow: 'hidden',
  borderRadius: '10px',
  background: theme.colors.background1,
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '160px',
    },
  },
})

export const logoMarqueeTrack = style({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
  selectors: {
    '&::before': {
      content: '',
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 10%, rgba(255, 255, 255, 0) 90%, rgba(255, 255, 255, 1) 100%)',
      zIndex: 2,
      pointerEvents: 'none',
    },
  },
})

export const logoMarqueeInner = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  width: 'max-content',
  minWidth: '100%',
  height: '100%',
  padding: '14px 0',
  animation: `${marqueeScroll} 28s linear infinite`,
  '@media': {
    'screen and (min-width: 768px)': {
      gap: '18px',
      padding: '22px 0',
    },
  },
})

export const logoMarqueeItem = style({
  width: '64px',
  height: '64px',
  borderRadius: '12px',
  overflow: 'hidden',
  background: theme.colors.background1,
  boxShadow: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  '@media': {
    'screen and (min-width: 768px)': {
      width: '86px',
      height: '86px',
      borderRadius: '22px',
    },
  },
})

export const logoMarqueeImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
})

export const montageLabel = style({
  fontSize: '12px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: theme.colors.text4,
  fontWeight: 700,
})

export const montageValue = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '24px',
  lineHeight: 1,
  whiteSpace: 'pre-line',
  color: theme.colors.text1,
  '@media': {
    'screen and (min-width: 768px)': {
      marginTop: '10px',
      fontSize: '28px',
    },
  },
})

export const montageBody = style({
  marginTop: '10px',
  fontSize: '14px',
  lineHeight: 1.55,
  color: theme.colors.text3,
})

export const daoMiniList = style({
  display: 'grid',
  gap: '10px',
  marginTop: '14px',
})

export const daoMiniCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '16px',
  background: theme.colors.background2,
})

export const daoMiniAvatar = style({
  width: '40px',
  height: '40px',
  borderRadius: '14px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '14px',
  color: theme.colors.text1,
})

export const heroFooterStat = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
})

export const heroFooterValue = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '24px',
  color: theme.colors.text1,
})

export const statGrid = style({
  display: 'grid',
  width: '100%',
  gap: '16px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    'screen and (min-width: 1080px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
})

export const statCard = style({
  position: 'relative',
  overflow: 'hidden',
  minHeight: '178px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '22px',
  boxShadow: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: softBlueBorder,
      backgroundColor: softBlueBackground,
    },
  },
})

export const statAccent = style({
  position: 'absolute',
  top: '18px',
  right: '18px',
  width: '54px',
  height: '54px',
  borderRadius: '12px',
  opacity: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  lineHeight: 1,
})

export const statAccentDao = style({ background: theme.colors.background2 })
export const statAccentTreasury = style({ background: theme.colors.positive })
export const statAccentAuction = style({ background: theme.colors.warning })
export const statAccentProposal = style({ background: theme.colors.focusRing })
export const statAccentMembers = style({ background: theme.colors.negative })
export const statAccentTokens = style({ background: theme.colors.focusRing })

export const statLabel = style({
  position: 'relative',
  zIndex: 1,
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.colors.text4,
})

export const statValue = style({
  position: 'relative',
  zIndex: 1,
  marginTop: '18px',
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '36px',
  lineHeight: 1,
  color: theme.colors.text1,
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '42px',
    },
  },
})

export const statDetail = style({
  position: 'relative',
  zIndex: 1,
  marginTop: '18px',
  maxWidth: '28ch',
  fontSize: '14px',
  lineHeight: 1.55,
  color: theme.colors.text3,
})

export const sectionTopRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '28px',
  '@media': {
    'screen and (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
  },
})

export const sectionInlineRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '28px',
  '@media': {
    'screen and (min-width: 960px)': {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
})

export const sectionInlineCopy = style({
  maxWidth: '760px',
  fontSize: '16px',
  lineHeight: 1.55,
  color: theme.colors.text3,
  margin: 0,
})

export const tabs = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  '@media': {
    'screen and (max-width: 520px)': {
      width: '100%',
      flexWrap: 'nowrap',
      gap: '6px',
    },
  },
})

export const tabButton = style({
  minHeight: '42px',
  borderRadius: '999px',
  border: standardBorderThin,
  background: theme.colors.background1,
  padding: '10px 16px',
  fontSize: '14px',
  fontWeight: 700,
  color: theme.colors.text1,
  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  selectors: {
    '&:hover': {
      cursor: 'pointer',
      borderColor: softBlueBorder,
      backgroundColor: softBlueBackground,
    },
    '&:focus-visible': focusRing,
  },
  '@media': {
    'screen and (max-width: 520px)': {
      flex: '1 1 0',
      minWidth: 0,
      minHeight: '38px',
      padding: '8px 6px',
      fontSize: '13px',
    },
  },
})

export const activeTabButton = style({
  background: softBlueBackground,
  borderColor: softBlueBorder,
  color: theme.colors.text1,
  selectors: {
    '&:hover': {
      borderColor: softBlueBorder,
      backgroundColor: softBlueBackground,
      color: theme.colors.text1,
    },
  },
})

export const daoGrid = style({
  display: 'grid',
  width: '100%',
  gap: '16px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media': {
    'screen and (min-width: 700px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    'screen and (min-width: 1080px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    },
  },
})

export const mobileStatsHeading = style({
  display: 'block',
  margin: '28px 0 14px',
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '24px',
  lineHeight: 1.1,
  color: theme.colors.text1,
  '@media': {
    'screen and (min-width: 768px)': {
      display: 'none',
    },
  },
})

export const statsBlock = style({
  marginTop: '28px',
  '@media': {
    'screen and (max-width: 767px)': {
      marginTop: 0,
    },
    'screen and (min-width: 768px)': {
      marginTop: '48px',
    },
  },
})

export const daoCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  minHeight: '320px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '18px',
  boxShadow: 'none',
  minWidth: 0,
  color: 'inherit',
  textDecoration: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: softBlueBorder,
      backgroundColor: softBlueBackground,
      cursor: 'pointer',
    },
    '&:focus-visible': focusRing,
  },
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '360px',
    },
  },
})

export const daoTop = style({
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
})

export const daoChainBadge = style({
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  border: standardBorderThin,
  background: theme.colors.background1,
  boxShadow: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
})

export const daoChainBadgeImage = style({
  width: '20px',
  height: '20px',
  objectFit: 'contain',
  display: 'block',
})

export const daoIdentity = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  minWidth: 0,
})

export const daoAvatar = style({
  width: '52px',
  height: '52px',
  borderRadius: '999px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '18px',
  fontWeight: 700,
  flexShrink: 0,
  overflow: 'hidden',
})

export const daoAvatarSurfaceA = style({
  background: theme.colors.background2,
  color: theme.colors.text1,
})
export const daoAvatarSurfaceB = style({
  background: `color-mix(in srgb, ${theme.colors.focusRing} 22%, ${theme.colors.background1})`,
  color: theme.colors.text1,
})
export const daoAvatarSurfaceC = style({
  background: theme.colors.positive,
  color: theme.colors.text1,
})
export const daoAvatarSurfaceD = style({
  background: theme.colors.warning,
  color: theme.colors.text1,
})

export const daoAvatarImage = style({
  width: '100%',
  height: '100%',
  borderRadius: 'inherit',
  objectFit: 'cover',
  display: 'block',
})

export const daoName = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '20px',
  lineHeight: 1.05,
  color: theme.colors.text1,
  overflowWrap: 'anywhere',
})

export const daoDescription = style({
  marginTop: '6px',
  fontSize: '14px',
  lineHeight: 1.6,
  color: theme.colors.text3,
})

globalStyle(`${daoDescription} p`, {
  margin: 0,
})

globalStyle(`${daoDescription} strong`, {
  fontWeight: 700,
  color: theme.colors.text2,
})

export const badge = style({
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: '999px',
  border: standardBorderThin,
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 700,
})

export const daoSignal = style({
  display: 'grid',
  gap: '6px',
  marginTop: 'auto',
  padding: '14px 16px',
  borderRadius: '10px',
  background: theme.colors.background2,
})

export const daoSignalLabel = style({
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: theme.colors.text4,
  fontWeight: 700,
})

export const daoSignalValue = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '18px',
  lineHeight: 1.2,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  color: theme.colors.text1,
})

export const cardLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  color: theme.colors.text1,
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      opacity: 0.7,
    },
    '&:focus-visible': focusRing,
  },
})

export const scrollRow = style({
  display: 'grid',
  gap: '16px',
  gridAutoFlow: 'column',
  gridAutoColumns: 'minmax(84vw, 1fr)',
  overflowX: 'auto',
  paddingBottom: '8px',
  scrollSnapType: 'x mandatory',
  selectors: {
    '&::-webkit-scrollbar': {
      height: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.colors.border,
      borderRadius: '999px',
    },
  },
  '@media': {
    'screen and (min-width: 640px)': {
      gridAutoColumns: 'minmax(280px, 1fr)',
    },
    'screen and (min-width: 1080px)': {
      gridAutoColumns: 'minmax(280px, 320px)',
    },
  },
})

export const coiningCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  minHeight: '320px',
  scrollSnapAlign: 'start',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '18px',
  boxShadow: 'none',
  minWidth: 0,
  color: 'inherit',
  textDecoration: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: softBlueBorder,
      backgroundColor: softBlueBackground,
      cursor: 'pointer',
    },
    '&:focus-visible': focusRing,
  },
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '360px',
    },
  },
})

export const coiningPreview = style({
  position: 'relative',
  minHeight: '180px',
  borderRadius: '10px',
  overflow: 'hidden',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  border: standardBorderThin,
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '220px',
    },
  },
})

export const coiningPreviewSurfaceA = style({ background: theme.colors.accent })
export const coiningPreviewSurfaceB = style({ background: theme.colors.warning })
export const coiningPreviewSurfaceC = style({ background: theme.colors.positive })
export const coiningPreviewSurfaceD = style({ background: theme.colors.background2 })

export const coiningPreviewTop = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
})

export const coiningPreviewMark = style({
  alignSelf: 'flex-start',
  display: 'inline-flex',
  borderRadius: '999px',
  background: theme.colors.background1,
  border: standardBorderThin,
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 700,
  color: theme.colors.text1,
})

export const coiningNetworkBadge = style({
  width: '34px',
  height: '34px',
  borderRadius: '10px',
  border: standardBorderThin,
  background: theme.colors.background1,
  boxShadow: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  overflow: 'hidden',
})

export const coiningPreviewTitle = style({
  maxWidth: '12ch',
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '26px',
  lineHeight: 0.95,
  color: theme.colors.text1,
  overflowWrap: 'anywhere',
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '32px',
    },
  },
})

export const coiningMeta = style({
  display: 'grid',
  gap: '6px',
  flex: 1,
})

export const coiningTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '22px',
  lineHeight: 1.05,
  color: theme.colors.text1,
})

export const mutedText = style({
  fontSize: '14px',
  lineHeight: 1.6,
  color: theme.colors.text3,
})

export const amountPill = style({
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: '999px',
  padding: '7px 12px',
  background: theme.colors.background2,
  color: theme.colors.text1,
  border: standardBorderThin,
  fontSize: '13px',
  fontWeight: 700,
})

export const droposalList = style({
  display: 'grid',
  gap: '14px',
})

export const droposalCard = style({
  display: 'grid',
  gap: '14px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '18px',
  boxShadow: 'none',
  color: 'inherit',
  textDecoration: 'none',
  transition: 'border-color 0.15s ease, background-color 0.15s ease',
  selectors: {
    '&:hover': {
      borderColor: softBlueBorder,
      backgroundColor: softBlueBackground,
      cursor: 'pointer',
    },
    '&:focus-visible': focusRing,
  },
  '@media': {
    'screen and (min-width: 880px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      alignItems: 'center',
    },
  },
})

export const droposalMeta = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  alignItems: 'center',
})

export const statusBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '88px',
  borderRadius: '999px',
  border: standardBorderThin,
  padding: '7px 12px',
  fontSize: '12px',
  fontWeight: 700,
  background: 'transparent',
})

export const daoBadge = style({
  background: '#F7F3E8',
  color: '#4F4738',
  borderColor: theme.colors.text1,
})

export const droposalTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '20px',
  lineHeight: 1.05,
  color: theme.colors.text1,
  overflowWrap: 'anywhere',
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '24px',
    },
  },
})

export const droposalSummary = style({
  fontSize: '15px',
  lineHeight: 1.65,
  color: theme.colors.text3,
  maxWidth: '72ch',
})

export const droposalAside = style({
  display: 'grid',
  gap: '12px',
  justifyItems: 'start',
  '@media': {
    'screen and (min-width: 880px)': {
      justifyItems: 'end',
      textAlign: 'right',
    },
  },
})

export const stepsGrid = style({
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media': {
    'screen and (min-width: 860px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
})

export const stepCard = style({
  minHeight: '170px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '22px',
  boxShadow: 'none',
})

export const stepHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
})

export const stepMarker = style({
  display: 'inline-flex',
  minWidth: '48px',
  height: '48px',
  padding: '0 16px',
  borderRadius: '10px',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.colors.focusRing,
  border: 'none',
  color: theme.colors.background1,
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '18px',
  flexShrink: 0,
})

export const stepTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '28px',
  lineHeight: 1.02,
  color: theme.colors.text1,
})

export const stepBody = style({
  marginTop: '14px',
  fontSize: '15px',
  lineHeight: 1.65,
  color: theme.colors.text3,
})

export const valueGrid = style({
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media': {
    'screen and (min-width: 700px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    'screen and (min-width: 1080px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
  },
})

export const featureStrip = style({
  position: 'relative',
  display: 'grid',
  width: '100%',
  maxWidth: '100%',
  alignSelf: 'stretch',
  gap: '18px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media': {
    'screen and (min-width: 700px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    'screen and (min-width: 1080px)': {
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '24px',
    },
  },
})

export const featureItem = style({
  display: 'grid',
  gridTemplateColumns: '42px minmax(0, 1fr)',
  gap: '12px',
  alignItems: 'center',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 700px)': {
      gridTemplateColumns: '42px minmax(0, 1fr)',
      justifyItems: 'stretch',
      alignItems: 'center',
      gap: '12px',
    },
  },
})

export const featureIconBadge = style({
  position: 'relative',
  zIndex: 1,
  width: '42px',
  height: '42px',
  borderRadius: '14px',
  background: theme.colors.background2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.text1,
})

globalStyle(`${featureIconBadge} svg`, {
  width: '20px',
  height: '20px',
  display: 'block',
})

export const featureLabel = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '17px',
  lineHeight: 1.2,
  fontWeight: 700,
  color: theme.colors.text1,
  overflowWrap: 'anywhere',
})

export const useCaseGrid = style({
  display: 'grid',
  width: '100%',
  maxWidth: '100%',
  alignSelf: 'stretch',
  gap: '16px',
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
  '@media': {
    'screen and (min-width: 640px)': {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
    'screen and (min-width: 900px)': {
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    },
    'screen and (min-width: 1180px)': {
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    },
  },
})

export const valueCard = style({
  minHeight: '150px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '20px',
  boxShadow: 'none',
})

export const compactValueCard = style({
  minHeight: '96px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '16px',
  boxShadow: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 768px)': {
      minHeight: '108px',
      padding: '18px',
    },
  },
})

export const valueTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '24px',
  lineHeight: 1.05,
  color: theme.colors.text1,
})

export const compactValueTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '18px',
  lineHeight: 1.2,
  color: theme.colors.text1,
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
})

export const compactValueEmoji = style({
  fontSize: '28px',
  lineHeight: 1,
})

export const compactValueImage = style({
  width: '32px',
  height: '32px',
  objectFit: 'contain',
  display: 'block',
})

export const activityList = style({
  display: 'grid',
  gap: '14px',
})

export const activityCard = style({
  display: 'grid',
  gap: '10px',
  borderRadius: '12px',
  border: standardBorder,
  background: theme.colors.background1,
  padding: '18px',
  '@media': {
    'screen and (min-width: 820px)': {
      gridTemplateColumns: '140px minmax(0, 1fr)',
      alignItems: 'start',
      gap: '18px',
    },
  },
})

export const activityMeta = style({
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '12px',
  fontWeight: 700,
  background: theme.colors.background2,
  color: theme.colors.text3,
  border: standardBorderThin,
})

export const activityTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '22px',
  lineHeight: 1.08,
  color: theme.colors.text1,
})

export const finalCta = style({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '16px',
  border: standardBorder,
  background: theme.colors.background2,
  color: theme.colors.text1,
  padding: '30px 22px',
  boxShadow: 'none',
  '@media': {
    'screen and (min-width: 768px)': {
      padding: '40px 34px',
    },
  },
})

export const finalCtaGlow = style({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background: 'transparent',
})

export const finalCtaContent = style({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  gap: '24px',
  alignItems: 'center',
  minWidth: 0,
  '@media': {
    'screen and (min-width: 980px)': {
      gridTemplateColumns: 'minmax(0, 1fr) auto',
      gap: '32px',
    },
  },
})

export const finalCtaTitle = style({
  fontFamily: 'ptRoot, sans-serif',
  fontSize: '32px',
  lineHeight: 1,
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  '@media': {
    'screen and (min-width: 768px)': {
      fontSize: '52px',
      whiteSpace: 'nowrap',
      overflowWrap: 'normal',
    },
  },
})

export const finalChecklist = style({
  marginTop: '12px',
  marginBottom: 0,
  padding: 0,
  listStyle: 'none',
  display: 'grid',
  gap: '10px',
})

export const finalChecklistItem = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  fontSize: '15px',
  lineHeight: 1.55,
  color: theme.colors.text3,
  '@media': {
    'screen and (min-width: 768px)': {
      alignItems: 'center',
      fontSize: '17px',
      lineHeight: 1.6,
    },
  },
})

export const finalChecklistMarker = style({
  minWidth: '24px',
  color: theme.colors.text1,
  fontWeight: 700,
})

export const finalActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'stretch',
  '@media': {
    'screen and (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
    },
    'screen and (min-width: 980px)': {
      justifyContent: 'flex-end',
    },
  },
})

export const aboutCtaButton = style({
  borderRadius: '999px',
  transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  selectors: {
    '&:not([disabled]):hover': {
      borderColor: theme.colors.focusRing,
      backgroundColor: `color-mix(in srgb, ${theme.colors.focusRing} 14%, ${theme.colors.background1})`,
    },
    '&:focus-visible': focusRing,
  },
})

globalStyle(`${aboutCtaButton}.zord-button-primary:not([disabled]):hover`, {
  borderColor: theme.colors.focusRing,
  backgroundColor: `color-mix(in srgb, ${theme.colors.focusRing} 82%, ${theme.colors.text1})`,
  color: theme.colors.background1,
})

globalStyle(`${aboutCtaButton}.zord-button-outline:not([disabled]):hover`, {
  borderColor: theme.colors.focusRing,
  backgroundColor: `color-mix(in srgb, ${theme.colors.focusRing} 14%, ${theme.colors.background1})`,
  color: theme.colors.text1,
})

globalStyle(`${aboutCtaButton}.zord-button-ghost:not([disabled]):hover`, {
  borderColor: theme.colors.focusRing,
  backgroundColor: `color-mix(in srgb, ${theme.colors.focusRing} 16%, ${theme.colors.background1})`,
  color: theme.colors.text1,
})

export const subLink = style({
  color: theme.colors.text3,
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  width: 'fit-content',
  selectors: {
    '&:hover': {
      color: theme.colors.text1,
    },
    '&:focus-visible': focusRing,
  },
})

export const heroSubLink = style({
  color: theme.colors.text3,
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  selectors: {
    '&:hover': {
      color: theme.colors.text1,
    },
    '&:focus-visible': focusRing,
  },
})

export const helperText = style({
  fontSize: '14px',
  lineHeight: 1.55,
  color: theme.colors.text3,
})

export const governanceCopy = style({
  maxWidth: '720px',
  fontSize: '17px',
  lineHeight: 1.6,
  color: theme.colors.text3,
})

export const governanceLink = style({
  color: theme.colors.focusRing,
  textDecoration: 'underline',
})

globalStyle(
  `html[data-theme-mode="dark"] ${page} :is(${sectionTitle}, ${heroTitle}, ${montageValue}, ${heroFooterValue}, ${statValue}, ${tabButton}, ${activeTabButton}, ${mobileStatsHeading}, ${daoName}, ${daoSignalValue}, ${coiningTitle}, ${amountPill}, ${droposalTitle}, ${stepTitle}, ${featureItem})`,
  {
    color: theme.colors.text1,
  }
)

globalStyle(
  `html[data-theme-mode="dark"] ${page} :is(${sectionCopy}, ${introCopyNoWrap}, ${heroText}, ${heroHighlight}, ${montageBody}, ${statLabel}, ${statDetail}, ${sectionInlineCopy}, ${daoDescription}, ${daoSignalLabel}, ${mutedText}, ${droposalSummary}, ${stepBody}, ${subLink}, ${heroSubLink}, ${helperText}, ${governanceCopy})`,
  {
    color: theme.colors.text3,
  }
)

globalStyle(`html[data-theme-mode="dark"] ${page} :is(${heroHighlightDot})`, {
  background: theme.colors.text1,
})

globalStyle(`html[data-theme-mode="dark"] ${page} ${aboutCtaButton}:not([disabled]):hover`, {
  borderColor: theme.colors.focusRing,
  backgroundColor: `color-mix(in srgb, ${theme.colors.focusRing} 30%, ${theme.colors.background1})`,
  color: theme.colors.text1,
})

globalStyle(
  `html[data-theme-mode="dark"] ${page} ${aboutCtaButton}.zord-button-primary:not([disabled]):hover`,
  {
    borderColor: theme.colors.focusRing,
    backgroundColor: `color-mix(in srgb, ${theme.colors.focusRing} 70%, ${theme.colors.text1})`,
    color: theme.colors.background1,
  }
)

globalStyle(`html[data-theme-mode="dark"] ${page} :is(${daoMiniCard}, ${stepCard})`, {
  background: theme.colors.background2,
})

globalStyle(
  `html[data-theme-mode="dark"] ${page} :is(${coiningPreviewTitle})`,
  {
    color: theme.colors.background1,
  }
)

globalStyle(`html[data-theme-mode="dark"] ${logoMarqueeTrack}::before`, {
  background:
    'linear-gradient(90deg, rgba(31, 32, 36, 1) 0%, rgba(31, 32, 36, 0) 10%, rgba(31, 32, 36, 0) 90%, rgba(31, 32, 36, 1) 100%)',
})
