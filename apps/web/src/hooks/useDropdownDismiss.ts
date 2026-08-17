import React from 'react'

type UseDropdownDismissOptions = {
  isOpen: boolean
  onDismiss: () => void
  rootRef: React.RefObject<HTMLElement | null>
  triggerRef?: React.RefObject<HTMLElement | null>
}

export const useDropdownDismiss = ({
  isOpen,
  onDismiss,
  rootRef,
  triggerRef,
}: UseDropdownDismissOptions) => {
  React.useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onDismiss()
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      onDismiss()
      triggerRef?.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onDismiss, rootRef, triggerRef])
}
