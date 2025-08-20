import { omit } from 'lodash'
import { useRouter } from 'next/router'
import { useCallback } from 'react'

export const usePagination = (hasNext?: boolean) => {
  const { query, pathname } = useRouter()

  const handlePageBack = useCallback(() => {
    // user is on the first page
    if (!query.page)
      return {
        pathname,
        query: {
          ...query,
        },
      }

    // user is at least on the second page
    return Number(query.page) > 2
      ? {
          pathname,
          query: {
            ...query,
            page: Number(query.page) - 1,
          },
        }
      : {
          pathname,
          query: omit(query, ['page']),
        }
  }, [query, pathname])

  const handlePageForward = useCallback(() => {
    // there are more results to be fetched
    if (!hasNext)
      return {
        pathname,
        query: {
          page: query.page,
        },
      }

    // user is on the first page
    if (!query.page)
      return {
        pathname,
        query: {
          ...query,
          page: 2,
        },
      }

    // user is at least on the second page
    return {
      pathname,
      query: {
        ...query,
        page: Number(query.page) + 1,
      },
    }
  }, [hasNext, pathname, query])

  return { handlePageBack, handlePageForward }
}
