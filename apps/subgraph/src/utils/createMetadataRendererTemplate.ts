import { Address, Bytes, DataSourceContext } from '@graphprotocol/graph-ts'

import {
  MetadataRendererBase as MetadataRendererBaseTemplate,
  MetadataRendererV1 as MetadataRendererV1Template,
} from '../../generated/templates'
import { MetadataRendererBase as MetadataRendererBaseContract } from '../../generated/templates/MetadataRendererBase/MetadataRendererBase'

export function createMetadataRendererTemplate(
  rendererContract: MetadataRendererBaseContract,
  rendererAddress: Address,
  ctx: DataSourceContext
): void {
  let isBaseRenderer = rendererContract.try_supportsInterface(
    Bytes.fromHexString('0x2b983814')
  )

  if (isBaseRenderer.reverted) {
    MetadataRendererV1Template.createWithContext(rendererAddress, ctx)
  } else if (isBaseRenderer.value == true) {
    MetadataRendererBaseTemplate.createWithContext(rendererAddress, ctx)
  } else {
    // Unsupported renderer
  }
}
