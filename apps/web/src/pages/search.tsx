import { Meta } from 'src/components/Meta'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { SearchResultsPage } from 'src/modules/search'

import { NextPageWithLayout } from './_app'

const SearchPage: NextPageWithLayout = () => {
  return (
    <>
      <Meta title={'Search'} type={'website'} path={'/search'} />
      <SearchResultsPage />
    </>
  )
}

SearchPage.getLayout = getDefaultLayout

export default SearchPage
