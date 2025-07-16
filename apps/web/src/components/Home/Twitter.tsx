import { Stack, Text, atoms, mixins } from '@buildeross/zord'
import React from 'react'

const Twitter = () => (
  <Stack align={'center'} mt={'x9'}>
    <Text fontSize={18} fontWeight={'label'}>
      Have more questions?
    </Text>
    <Text
      as={'a'}
      href={'https://twitter.com/nounsbuilder'}
      target={'_blank'}
      rel={'noopener noreferrer'}
      className={`${atoms({
        py: 'x3',
        px: 'x4',
        borderRadius: 'curved',
        backgroundColor: 'border',
        fontWeight: 'label',
        mt: 'x4',
      })} ${mixins({ hoverFadeOut: true })}`}
    >
      Nouns Builder on Twitter
    </Text>
  </Stack>
)

export default Twitter
