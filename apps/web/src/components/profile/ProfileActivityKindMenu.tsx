import { Icon } from '@buildeross/zord'
import React from 'react'
import {
  activityKindDropdown,
  activityKindDropdownMenu,
  activityTypeDropdownButton,
  activityTypeDropdownMenu,
  activityTypeDropdownOption,
} from 'src/styles/profile.css'
import type {
  ProfileActivityFilterOption,
  ProfileActivityKind,
} from 'src/utils/profileDashboard'

type ProfileActivityKindMenuProps = {
  label: string
  options: ProfileActivityFilterOption[]
  selectedKinds: ProfileActivityKind[]
  onChange: (selectedKinds: ProfileActivityKind[]) => void
}

export const ProfileActivityKindMenu: React.FC<ProfileActivityKindMenuProps> = ({
  label,
  options,
  selectedKinds,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const menuId = `profile-activity-kind-${React.useId().replace(/:/g, '')}`
  const selectedSet = React.useMemo(() => new Set(selectedKinds), [selectedKinds])
  const selectedOptions = options.filter((option) => selectedSet.has(option.value))
  const summary =
    selectedOptions.length === 0
      ? 'All'
      : selectedOptions.length === 1
        ? selectedOptions[0].label
        : `${selectedOptions.length} selected`

  React.useEffect(() => {
    if (!isOpen) return

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const toggleKind = (kind: ProfileActivityKind) => {
    onChange(
      selectedSet.has(kind)
        ? selectedKinds.filter((selectedKind) => selectedKind !== kind)
        : [...selectedKinds, kind]
    )
  }

  return (
    <div ref={rootRef} className={activityKindDropdown}>
      <button
        ref={buttonRef}
        type="button"
        className={activityTypeDropdownButton}
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{summary}</span>
        <Icon id="chevron-down" fill="tertiary" pointerEvents="none" />
      </button>
      {isOpen ? (
        <div
          id={menuId}
          className={[activityTypeDropdownMenu, activityKindDropdownMenu].join(' ')}
          role="group"
          aria-label={`${label} options`}
        >
          {options.map((option) => (
            <label key={option.value} className={activityTypeDropdownOption}>
              <input
                type="checkbox"
                checked={selectedSet.has(option.value)}
                onChange={() => toggleKind(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  )
}
