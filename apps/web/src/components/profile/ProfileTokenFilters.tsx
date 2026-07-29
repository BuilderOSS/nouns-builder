import type { CHAIN_ID } from '@buildeross/types'
import { Button, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'
import {
  activeDaoFilterChip,
  activeDaoFilterHelp,
  filterDropdownIcon,
  filterBar,
  filterControl,
  filterHeader,
  filterLabel,
  filterRightControls,
  filterSelect,
  filterSelectWrapper,
} from 'src/styles/profile.css'
import { TOKEN_SORT_OPTIONS, type TokenSortOption } from 'src/utils/profileIdentity'

export type ProfileTokenFiltersValue = {
  sort: TokenSortOption
  daoKeys: string[]
}

type ProfileTokenFiltersProps = {
  daos: Array<{
    chainId: CHAIN_ID
    collectionAddress: string
    name: string
  }>
  value: ProfileTokenFiltersValue
  onChange: (value: ProfileTokenFiltersValue) => void
  onReset: () => void
}

export const ProfileTokenFilters: React.FC<ProfileTokenFiltersProps> = ({
  daos,
  value,
  onChange,
  onReset,
}) => {
  const activeFilterCount =
    Number(value.sort !== 'newest') + Number(value.daoKeys.length > 0)
  const selectedDaos = React.useMemo(
    () =>
      value.daoKeys
        .map((daoKey) =>
          daos.find(
            (dao) => `${dao.chainId}:${dao.collectionAddress}`.toLowerCase() === daoKey
          )
        )
        .filter((dao): dao is (typeof daos)[number] => !!dao),
    [daos, value.daoKeys]
  )
  const daoFilterLabel =
    selectedDaos.length === 0
      ? 'All DAOs'
      : selectedDaos.map((dao) => dao.name).join(', ')

  return (
    <Flex className={filterBar} direction="column">
      <div className={filterHeader}>
        <Flex align="center" gap="x2" wrap>
          <span
            className={activeDaoFilterHelp}
            tabIndex={0}
            aria-label="Select DAOs from the sidebar to filter this profile activity by DAO."
          >
            <Text className={activeDaoFilterChip}>{daoFilterLabel}</Text>
          </span>
        </Flex>

        <div className={filterRightControls}>
          <label className={filterControl}>
            <Text className={filterLabel}>Sort</Text>
            <div className={filterSelectWrapper}>
              <select
                aria-label="Sort owned tokens"
                className={filterSelect}
                value={value.sort}
                onChange={(event) =>
                  onChange({ ...value, sort: event.target.value as TokenSortOption })
                }
              >
                {TOKEN_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Icon
                id="chevron-down"
                fill="tertiary"
                pointerEvents="none"
                className={filterDropdownIcon}
              />
            </div>
          </label>

          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            disabled={activeFilterCount === 0}
          >
            Reset
          </Button>
        </div>
      </div>
    </Flex>
  )
}
