import { Icon, Spinner } from '@buildeross/zord'
import React, { ChangeEventHandler, KeyboardEventHandler, useEffect, useRef } from 'react'

import {
  clearIconStyle,
  helperTextStyle,
  searchIconStyle,
  searchInputStyle,
  searchInputWithClear,
  searchInputWrapper,
} from './SearchInput.css'

interface SearchInputProps {
  id: string
  value: string
  placeholder?: string
  onChange: ChangeEventHandler<HTMLInputElement>
  onSearch?: () => void
  onClear?: () => void
  showClear?: boolean
  disabled?: boolean
  minSearchLength?: number
  isLoading?: boolean
}

export const SearchInput: React.FC<SearchInputProps> = ({
  id,
  value,
  placeholder = 'Search...',
  onChange,
  onSearch,
  onClear,
  showClear = false,
  disabled = false,
  minSearchLength = 0,
  isLoading = false,
}) => {
  const hasSearchedRef = useRef(false)

  // Reset "searched" whenever the value changes
  useEffect(() => {
    hasSearchedRef.current = false
  }, [value])

  const trimmed = value.trim()
  const isSearchEnabled = trimmed.length >= minSearchLength && !isLoading
  const showHelper = trimmed.length > 0 && !hasSearchedRef.current
  const helperText = isSearchEnabled
    ? 'Press Enter to search'
    : `Minimum ${minSearchLength} characters`

  const triggerSearch = () => {
    if (!onSearch || !isSearchEnabled) return
    hasSearchedRef.current = true
    onSearch()
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      triggerSearch()
    }
  }

  return (
    <div className={searchInputWrapper}>
      <input
        id={id}
        type="text"
        onChange={onChange}
        onKeyDown={handleKeyDown}
        value={value}
        className={`${searchInputStyle} ${showClear ? searchInputWithClear : ''}`}
        placeholder={placeholder}
        disabled={disabled || isLoading}
      />

      {showClear && trimmed.length > 0 && onClear && (
        <button
          type="button"
          className={clearIconStyle}
          onClick={onClear}
          aria-label="Clear search"
        >
          <Icon id="cross" />
        </button>
      )}

      {onSearch && (
        <button
          type="button"
          className={searchIconStyle}
          onClick={triggerSearch}
          disabled={!isSearchEnabled}
          aria-label={isLoading ? 'Searching...' : 'Search'}
          style={{
            opacity: isSearchEnabled ? 1 : 0.5,
            cursor: isSearchEnabled ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? <Spinner size="sm" color="accent" /> : <Icon id="search" />}
        </button>
      )}

      <div className={`${helperTextStyle} ${showHelper ? 'visible' : 'hidden'}`}>
        {helperText}
      </div>
    </div>
  )
}
