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
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !triggerRef?.current?.contains(target)) {
        onDismiss()
      }
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
