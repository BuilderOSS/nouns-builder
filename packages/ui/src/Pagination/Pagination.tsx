import { useQueryParams } from '@buildeross/hooks/useQueryParams'
import { atoms, Flex, Icon } from '@buildeross/zord'
import React, { useCallback } from 'react'

import { useLinkComponent } from '../LinkComponentProvider'
import { hoverButton } from './Pagination.css'

type PaginationProps = {
  hasNextPage?: boolean
  scroll?: boolean
}

const createHref = ({
  pathname,
  query,
}: {
  pathname: string
  query: Record<string, any>
}) => {
  const params = new URLSearchParams(query).toString()
  return `${pathname}${params ? `?${params}` : ''}`
}

export const Pagination: React.FC<PaginationProps> = ({
  hasNextPage = false,
  scroll = false,
}) => {
  const { pathname, query } = useQueryParams()
  const Link = useLinkComponent()

  const handlePageBack = useCallback(() => {
    if (!query.page) return { pathname, query }

    const nextQuery = { ...query }

    if (Number(query.page) > 2) {
      nextQuery.page = String(Number(query.page) - 1)
    } else {
      delete nextQuery.page
    }

    return { pathname, query: nextQuery }
  }, [pathname, query])

  const handlePageForward = useCallback(() => {
    if (!hasNextPage) return { pathname, query }

    const nextQuery = { ...query }
    nextQuery.page = String(query.page ? Number(query.page) + 1 : 2)

    return {
      pathname,
      query: nextQuery,
    }
  }, [pathname, query, hasNextPage])

  const isFirst = !query.page
  const isLast = !hasNextPage

  return (
    <Flex direction="row" w="100%" justify="center" my="x16">
      <Link
        href={createHref(handlePageBack())}
        scroll={scroll}
        className={atoms({ pointerEvents: isFirst ? 'none' : 'auto' })}
      >
        <Flex
          as="button"
          backgroundColor="background1"
          borderRadius="round"
          borderColor="border"
          borderStyle="solid"
          borderWidth="normal"
          p="x1"
          mx="x1"
          disabled={isFirst}
          style={{ cursor: isFirst ? 'auto' : 'pointer' }}
          className={isFirst ? undefined : hoverButton}
        >
          <Flex style={{ height: 24, width: 24 }} placeItems="center" justify="center">
            <Icon id="arrowLeft" style={{ opacity: isFirst ? 0.3 : 1 }} />
          </Flex>
        </Flex>
      </Link>

      <Link
        href={createHref(handlePageForward())}
        scroll={scroll}
        className={atoms({ pointerEvents: isLast ? 'none' : 'auto' })}
      >
        <Flex
          as="button"
          backgroundColor="background1"
          borderRadius="round"
          borderColor="border"
          borderStyle="solid"
          borderWidth="normal"
          p="x1"
          mx="x1"
          disabled={isLast}
          style={{ cursor: isLast ? 'auto' : 'pointer' }}
          className={isLast ? undefined : hoverButton}
        >
          <Flex style={{ height: 24, width: 24 }} placeItems="center" justify="center">
            <Icon id="arrowRight" style={{ opacity: isLast ? 0.3 : 1 }} />
          </Flex>
        </Flex>
      </Link>
    </Flex>
  )
}
