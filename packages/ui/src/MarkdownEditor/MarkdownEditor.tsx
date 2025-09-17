import { getFetchableUrls, uploadFile } from '@buildeross/ipfs-service'
import { Flex, Stack } from '@buildeross/zord'
import React, { ReactElement } from 'react'

import { FieldError } from '../Fields'
import { MarkdownDisplay } from '../MarkdownDisplay'
import { defaultInputLabelStyle } from '../styles'

export type MarkdownEditorProps = {
  onChange: (value: string) => void
  value: string
  inputLabel: string | ReactElement
  errorMessage?: string
  disabled?: boolean
  fallback?: React.ReactNode
}

const saveImage = async function* (_data: ArrayBuffer, blob: Blob) {
  const file = new File([blob], (blob as File)?.name ?? 'image', { type: blob.type })
  const { cid } = await uploadFile(file, { cache: true, type: 'image' })
  yield getFetchableUrls(cid)?.[0] as string
  return true
}

// React element type checks (accept function, memo, forwardRef)
const REACT_MEMO_TYPE = Symbol.for('react.memo')
const REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref')
function isValidElementType(x: any): x is React.ComponentType<any> {
  if (!x) return false
  if (typeof x === 'function') return true
  if (typeof x === 'object') {
    const t = x.$$typeof
    return t === REACT_MEMO_TYPE || t === REACT_FORWARD_REF_TYPE
  }
  return false
}

/** Try several common shapes that react-mde may export */
function pickReactMde(mod: any): React.ComponentType<any> | null {
  const candidates = [
    mod?.ReactMde,
    mod?.default?.ReactMde,
    mod?.default?.default,
    mod?.default,
    mod,
  ]
  for (const c of candidates) {
    if (isValidElementType(c)) return c
  }
  return null
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  onChange,
  value,
  inputLabel,
  errorMessage = '',
  disabled = false,
  fallback,
}) => {
  const [selectedTab, setSelectedTab] = React.useState<'write' | 'preview'>(
    disabled ? 'preview' : 'write'
  )
  const [ReactMdeComp, setReactMdeComp] = React.useState<null | React.ComponentType<any>>(
    null
  )

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // client-only dynamic import
        const mod = await import('react-mde')
        const Comp = pickReactMde(mod)
        if (!Comp) {
          throw new Error(
            `react-mde export shape not recognized: keys=[${Object.keys(mod ?? {}).join(', ')}]`
          )
        }
        if (mounted) setReactMdeComp(() => Comp)
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.warn('[MarkdownEditor] Failed to load react-mde:', e)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <Stack pb={'x5'}>
      <Flex justify={'space-between'}>
        <label className={defaultInputLabelStyle}>{inputLabel}</label>
      </Flex>

      {!ReactMdeComp ? (
        <>{fallback ?? <MarkdownDisplay>{value}</MarkdownDisplay>}</>
      ) : (
        <ReactMdeComp
          readOnly={disabled}
          value={value}
          onChange={onChange}
          selectedTab={!disabled ? selectedTab : 'preview'}
          onTabChange={setSelectedTab}
          generateMarkdownPreview={async (markdown: string) => (
            <MarkdownDisplay>{markdown}</MarkdownDisplay>
          )}
          childProps={{ writeButton: { tabIndex: -1 } }}
          paste={{ saveImage, accept: 'image/*' }}
        />
      )}

      {!!errorMessage && <FieldError message={errorMessage} />}
    </Stack>
  )
}
