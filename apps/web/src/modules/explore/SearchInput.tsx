import { Icon, Spinner } from '@buildeross/zord'
import React, { ChangeEventHandler, KeyboardEventHandler, useCallback } from 'react'

import {
  clearIconStyle,
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
  const isSearchEnabled = value.trim().length >= minSearchLength

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && onSearch && isSearchEnabled && !isLoading) {
        onSearch()
      }
    },
    [onSearch, isSearchEnabled, isLoading]
  )

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

      {/* Clear icon - only show when there's text and showClear is true */}
      {showClear && value.trim().length > 0 && onClear && (
        <button
          type="button"
          className={clearIconStyle}
          onClick={onClear}
          aria-label="Clear search"
        >
          <Icon id="cross" />
        </button>
      )}

      {/* Search icon/spinner - always visible */}
      {onSearch && (
        <button
          type="button"
          className={searchIconStyle}
          onClick={onSearch}
          disabled={!isSearchEnabled || isLoading}
          aria-label={isLoading ? 'Searching...' : 'Search'}
          style={{
            opacity: isSearchEnabled ? 1 : 0.5,
            cursor: isSearchEnabled && !isLoading ? 'pointer' : 'not-allowed',
          }}
        >
          {isLoading ? <Spinner size="sm" color="accent" /> : <Icon id="search" />}
        </button>
      )}
    </div>
  )
}
