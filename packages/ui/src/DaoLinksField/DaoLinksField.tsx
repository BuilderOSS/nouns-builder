import { Box, Button, Flex, Icon, IconType, Text, vars } from '@buildeross/zord'
import React from 'react'

export type DaoLinkInput = {
  key: string
  url: string
}

export type KnownDaoLinkKey =
  | 'x'
  | 'discord'
  | 'github'
  | 'farcaster'
  | 'docs'
  | 'notion'
  | 'forum'
  | 'discourse'
  | 'website'

type KnownDaoLinkOption = {
  key: KnownDaoLinkKey
  label: string
  icon: IconType
}

const CUSTOM_LINK_KEY = '__custom__'

const KNOWN_DAO_LINK_OPTIONS: KnownDaoLinkOption[] = [
  { key: 'x', label: 'X', icon: 'x' },
  { key: 'discord', label: 'Discord', icon: 'discord' },
  { key: 'github', label: 'GitHub', icon: 'github' },
  { key: 'farcaster', label: 'Farcaster', icon: 'globe' },
  { key: 'docs', label: 'Docs', icon: 'globe' },
  { key: 'notion', label: 'Notion', icon: 'globe' },
  { key: 'forum', label: 'Forum', icon: 'globe' },
  { key: 'discourse', label: 'Discourse', icon: 'globe' },
  { key: 'website', label: 'Website', icon: 'globe' },
]

const normalizeDaoLinkKey = (key: string): string => {
  const normalized = key.trim().toLowerCase()
  return normalized === 'twitter' ? 'x' : normalized
}

const getKnownOption = (key: string): KnownDaoLinkOption | undefined =>
  KNOWN_DAO_LINK_OPTIONS.find((option) => option.key === normalizeDaoLinkKey(key))

const getIconForKey = (key: string): IconType => getKnownOption(key)?.icon || 'question'

interface DaoLinksFieldProps {
  value: DaoLinkInput[]
  onChange: (next: DaoLinkInput[]) => void
  onBlur?: (index: number, field: 'key' | 'url') => void
  inputLabel?: string
  helperText?: string
  addButtonLabel?: string
  keyPlaceholder?: string
  urlPlaceholder?: string
  getFieldError?: (index: number, field: 'key' | 'url') => string | undefined
  errorMessage?: string
}

export const DaoLinksField: React.FC<DaoLinksFieldProps> = ({
  value,
  onChange,
  onBlur,
  inputLabel = 'Additional links (optional)',
  helperText,
  addButtonLabel = '+ Add link',
  keyPlaceholder = 'custom key',
  urlPlaceholder = 'https://...',
  getFieldError,
  errorMessage,
}) => {
  const links = value || []

  const updateLinkAtIndex = (index: number, nextLink: DaoLinkInput) => {
    const nextLinks = [...links]
    nextLinks[index] = nextLink
    onChange(nextLinks)
  }

  const removeLinkAtIndex = (index: number) => {
    onChange(links.filter((_, i) => i !== index))
  }

  const addLink = () => {
    onChange([...links, { key: 'x', url: '' }])
  }

  return (
    <Box mt={'x6'} mb={'x4'}>
      <Flex justify={'space-between'} align={'center'} mb={'x2'}>
        <Text variant={'label-md'}>{inputLabel}</Text>
        <Button variant="ghost" size="sm" type="button" onClick={addLink}>
          {addButtonLabel}
        </Button>
      </Flex>

      {helperText ? (
        <Text variant={'paragraph-sm'} color={'text3'} mb={'x3'}>
          {helperText}
        </Text>
      ) : null}

      {links.length > 0 ? (
        <Flex direction={'column'} gap={'x2'}>
          {links.map((link, index) => {
            const knownOption = getKnownOption(link.key)
            const selectedValue = knownOption ? knownOption.key : CUSTOM_LINK_KEY

            return (
              <Flex key={`dao-link-${index}`} direction={'column'}>
                <Flex align={'center'} gap={'x2'}>
                  <Icon id={getIconForKey(link.key)} />

                  <Box
                    as="select"
                    value={selectedValue}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                      const nextValue = event.target.value
                      if (nextValue === CUSTOM_LINK_KEY) {
                        updateLinkAtIndex(index, {
                          ...link,
                          key: knownOption ? '' : link.key,
                        })
                        return
                      }

                      updateLinkAtIndex(index, { ...link, key: nextValue })
                    }}
                    onBlur={() => onBlur?.(index, 'key')}
                    style={{
                      border: `1px solid ${vars.color.border}`,
                      borderRadius: vars.radii.curved,
                      padding: vars.space.x3,
                      minHeight: 48,
                      minWidth: 150,
                      backgroundColor: vars.color.background1,
                      color: vars.color.text1,
                    }}
                  >
                    {KNOWN_DAO_LINK_OPTIONS.map((option) => (
                      <option value={option.key} key={option.key}>
                        {option.label}
                      </option>
                    ))}
                    <option value={CUSTOM_LINK_KEY}>Custom</option>
                  </Box>

                  {selectedValue === CUSTOM_LINK_KEY ? (
                    <Box
                      as="input"
                      type="text"
                      value={link.key}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        updateLinkAtIndex(index, { ...link, key: event.target.value })
                      }}
                      onBlur={() => onBlur?.(index, 'key')}
                      placeholder={keyPlaceholder}
                      style={{
                        border: `1px solid ${vars.color.border}`,
                        borderRadius: vars.radii.curved,
                        padding: vars.space.x3,
                        minHeight: 48,
                        width: '100%',
                        backgroundColor: vars.color.background1,
                        color: vars.color.text1,
                      }}
                    />
                  ) : null}

                  <Box
                    as="input"
                    type="text"
                    value={link.url}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      updateLinkAtIndex(index, { ...link, url: event.target.value })
                    }}
                    onBlur={() => onBlur?.(index, 'url')}
                    placeholder={urlPlaceholder}
                    style={{
                      border: `1px solid ${vars.color.border}`,
                      borderRadius: vars.radii.curved,
                      padding: vars.space.x3,
                      minHeight: 48,
                      width: '100%',
                      backgroundColor: vars.color.background1,
                      color: vars.color.text1,
                    }}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLinkAtIndex(index)}
                    aria-label={`Remove link ${index + 1}`}
                  >
                    <Icon id="cross" />
                  </Button>
                </Flex>

                {getFieldError ? (
                  <Flex direction={'column'} mt={'x1'}>
                    {getFieldError(index, 'key') ? (
                      <Text variant={'label-xs'} color={'negative'}>
                        {getFieldError(index, 'key')}
                      </Text>
                    ) : null}
                    {getFieldError(index, 'url') ? (
                      <Text variant={'label-xs'} color={'negative'}>
                        {getFieldError(index, 'url')}
                      </Text>
                    ) : null}
                  </Flex>
                ) : null}
              </Flex>
            )
          })}
        </Flex>
      ) : null}

      {errorMessage ? (
        <Text variant={'label-xs'} color={'negative'} mt={'x2'}>
          {errorMessage}
        </Text>
      ) : null}
    </Box>
  )
}
