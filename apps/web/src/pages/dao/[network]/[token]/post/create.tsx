import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { DefaultLayout } from '../../../../../layouts/DefaultLayout'

export default function CreatePostPage() {
  const router = useRouter()
  const { network, token } = router.query
  const [postContent, setPostContent] = useState('')

  const handleCancel = () => {
    router.back()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement post creation logic
    // eslint-disable-next-line no-console
    console.log('Create post:', { network, token, postContent })
  }

  return (
    <DefaultLayout>
      <Flex justify="center" py="x12" px="x4">
        <Box style={{ maxWidth: 640, width: '100%' }}>
          <Stack gap="x6">
            {/* Header */}
            <Box>
              <Text fontSize="35" fontWeight="display" mb="x2">
                Create Post
              </Text>
              <Text fontSize="16" color="text3">
                Share an update or announcement with the DAO community
              </Text>
            </Box>

            {/* DAO Context - TODO: Fetch and display actual DAO info */}
            <Box
              borderRadius="curved"
              borderStyle="solid"
              borderWidth="normal"
              borderColor="border"
              p="x4"
            >
              <Text fontSize="14" color="text3">
                Posting to: <strong>{token as string}</strong> on {network as string}
              </Text>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack gap="x4">
                {/* Content textarea */}
                <Box>
                  <Text fontSize="14" fontWeight="label" mb="x2">
                    Post Content
                  </Text>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={8}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--colors-border)',
                      backgroundColor: 'var(--colors-background2)',
                      color: 'var(--colors-text1)',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </Box>

                {/* Image upload placeholder */}
                <Box>
                  <Text fontSize="14" fontWeight="label" mb="x2">
                    Image (Optional)
                  </Text>
                  <Box
                    borderRadius="curved"
                    borderStyle="dashed"
                    borderWidth="normal"
                    borderColor="border"
                    p="x8"
                    style={{
                      textAlign: 'center',
                      cursor: 'not-allowed',
                      opacity: 0.6,
                    }}
                  >
                    <Text fontSize="14" color="text3">
                      Image upload coming soon
                    </Text>
                  </Box>
                </Box>

                {/* Action buttons */}
                <Flex gap="x3" justify="flex-end">
                  <Button variant="ghost" onClick={handleCancel} type="button">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!postContent.trim()}
                    style={{ cursor: 'not-allowed', opacity: 0.6 }}
                  >
                    Publish Post (Coming Soon)
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Flex>
    </DefaultLayout>
  )
}
