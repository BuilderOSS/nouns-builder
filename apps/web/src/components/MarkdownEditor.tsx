import { getFetchableUrls, uploadFile } from '@buildeross/ipfs-service'
import { Flex, Stack } from '@buildeross/zord'
import * as React from 'react'
import { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import ReactMde from 'react-mde'
import 'react-mde/lib/styles/css/react-mde-all.css'
import remarkGfm from 'remark-gfm'

import { Error } from 'src/components/Fields/Error'
import 'src/components/Fields/styles.css'
import { defaultInputLabelStyle } from 'src/components/Fields/styles.css'

interface MarkdownEditorProps {
  onChange: (value: string) => void
  value: string
  inputLabel: string | ReactElement
  errorMessage?: string
  disabled?: boolean
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  onChange,
  value,
  inputLabel,
  errorMessage,
  disabled,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    disabled ? 'preview' : 'write'
  )

  const saveImage = async function* (_data: ArrayBuffer, blob: Blob) {
    const file = new File([blob], (blob as File)?.name ?? 'image', { type: blob.type })
    const { cid } = await uploadFile(file, { cache: true, type: 'image' })
    yield getFetchableUrls(cid)?.[0] as string

    return true
  }

  return (
    <Stack pb={'x5'}>
      <Flex justify={'space-between'}>
        <label className={defaultInputLabelStyle}>{inputLabel}</label>
      </Flex>
      <ReactMde
        readOnly={disabled}
        value={value}
        onChange={onChange}
        selectedTab={!disabled ? selectedTab : 'preview'}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) =>
          Promise.resolve(
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
          )
        }
        childProps={{
          writeButton: {
            tabIndex: -1,
          },
        }}
        paste={{
          saveImage,
          accept: 'image/*',
        }}
      />
      {!!errorMessage && <Error message={errorMessage} />}
    </Stack>
  )
}
