import { Icon } from '@buildeross/zord'
import React, { useCallback, useEffect, useState } from 'react'

import * as styles from './GlobalSearch.css'
import { SearchPalette } from './SearchPalette'
import { useCurrentDaoScope } from './useSearchScope'

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
  )
}

/**
 * Nav search button plus the global search palette.
 * Opens with ⌘K / Ctrl+K anywhere, or "/" when not typing in a field.
 */
export const GlobalSearch: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [isMac, setIsMac] = useState(true)
  const daoScope = useCurrentDaoScope()
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent))
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((o) => !o)
      } else if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTypingTarget(event.target)
      ) {
        event.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <button
        type="button"
        className={styles.triggerButton}
        onClick={() => setOpen(true)}
        aria-label="Search"
        aria-haspopup="dialog"
      >
        <Icon id="search" size="sm" fill="text3" />
        <span className={styles.triggerLabel}>Search…</span>
        <span className={styles.triggerKbd}>{isMac ? '⌘K' : 'Ctrl K'}</span>
      </button>
      <SearchPalette open={open} onClose={close} daoScope={daoScope} />
    </>
  )
}
