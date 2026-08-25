import { vars } from '@buildeross/zord'
import { style } from '@vanilla-extract/css'

/**
 * Collapsed height for a propdate message before the "Read full update" toggle
 * appears. Keeps the propdates feed scannable — long milestone reports no longer
 * render full-height and bury the ones below them.
 */
export const PROPDATE_COLLAPSED_HEIGHT = '240px'

/**
 * Fade-out gradient over a collapsed message body. Tuned to the card message's
 * `background2` token so the clamp reads as a soft fade rather than a hard cut.
 */
export const fadingMessage = style({
  position: 'relative',
  ':after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '96px',
    pointerEvents: 'none',
    background: `linear-gradient(to top, ${vars.color.background2}, transparent)`,
  },
})
