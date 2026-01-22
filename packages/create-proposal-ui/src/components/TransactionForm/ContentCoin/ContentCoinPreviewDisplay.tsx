import { CHAIN_ID } from '@buildeross/types'
import { type CoinFormValues, ContentPostPreview } from '@buildeross/ui'

import { StickyPreviewContainer } from '../../StickyPreviewContainer'

export const ContentCoinPreviewDisplay: React.FC<{
  previewData: CoinFormValues
  chainId: CHAIN_ID
}> = ({ previewData, chainId }) => {
  return (
    <StickyPreviewContainer>
      <ContentPostPreview {...previewData} chainId={chainId} />
    </StickyPreviewContainer>
  )
}
