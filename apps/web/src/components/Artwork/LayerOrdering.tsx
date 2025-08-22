import { ImageProps, OrderedTraits } from '@buildeross/hooks'
import { defaultFormHeading } from '@buildeross/ui/styles'
import { Box } from '@buildeross/zord'
import React from 'react'

import { DragAndDropProps, LayerBox } from './LayerBox'

interface LayerOrderingProps {
  title?: string
  images?: ImageProps[]
  orderedLayers: OrderedTraits
  setOrderedLayers: (orderedLayers: OrderedTraits) => void
}

export const LayerOrdering: React.FC<LayerOrderingProps> = ({
  title,
  images,
  orderedLayers,
  setOrderedLayers,
}) => {
  /*  init layers and drag and drop  */
  const [dragAndDrop, setDragAndDrop] = React.useState<DragAndDropProps | null>(null)

  if (!images) return null

  return (
    <Box>
      <h3 className={defaultFormHeading}>{title}</h3>
      {orderedLayers && (
        <Box>
          {orderedLayers.map(({ trait, properties }, index) => (
            <LayerBox
              key={trait}
              trait={trait}
              properties={properties}
              ipfs={images}
              setDragAndDrop={setDragAndDrop}
              dragAndDrop={dragAndDrop}
              orderedLayers={orderedLayers}
              setOrderedLayers={setOrderedLayers}
              index={index}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}
