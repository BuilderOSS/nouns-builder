import sdk, {
  AddMiniApp,
  type Context,
  type FrameNotificationDetails,
} from '@farcaster/frame-sdk'
import React, { useCallback, useEffect, useState } from 'react'

interface FrameContextType {
  isSDKLoaded: boolean
  context: Context.FrameContext | undefined
  openUrl: (url: string) => Promise<void>
  close: () => Promise<void>
  added: boolean
  notificationDetails: FrameNotificationDetails | null
  lastEvent: string
  addFrame: () => Promise<void>
  addFrameResult: string
}

const FrameContext = React.createContext<FrameContextType | undefined>(undefined)

export function useFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [context, setContext] = useState<Context.FrameContext>()
  const [added, setAdded] = useState(false)
  const [notificationDetails, setNotificationDetails] =
    useState<FrameNotificationDetails | null>(null)
  const [lastEvent, setLastEvent] = useState('')
  const [addFrameResult, setAddFrameResult] = useState('')

  // SDK actions only work in mini app clients, so this pattern supports browser actions as well
  const openUrl = useCallback(
    async (url: string) => {
      if (context) {
        await sdk.actions.openUrl(url)
      } else {
        window.open(url, '_blank')
      }
    },
    [context]
  )

  const close = useCallback(async () => {
    if (context) {
      await sdk.actions.close()
    } else {
      window.close()
    }
  }, [context])

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null)
      const result = await sdk.actions.addFrame()

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails)
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notificaton token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : 'Added, got no notification details'
      )
    } catch (error) {
      if (
        error instanceof AddMiniApp.RejectedByUser ||
        error instanceof AddMiniApp.InvalidDomainManifest
      ) {
        setAddFrameResult(`Not added: ${error.message}`)
      } else {
        setAddFrameResult(`Error: ${error}`)
      }
    }
  }, [])

  useEffect(() => {
    // TODO: Load SDK only for mini app clients
    const load = async () => {
      const context = await sdk.context
      setContext(context)
      setIsSDKLoaded(true)

      sdk.on('frameAdded', ({ notificationDetails }) => {
        setAdded(true)
        setNotificationDetails(notificationDetails ?? null)
        setLastEvent('Frame added')
      })

      sdk.on('frameAddRejected', ({ reason }) => {
        setAdded(false)
        setLastEvent(`Frame add rejected: ${reason}`)
      })

      sdk.on('frameRemoved', () => {
        setAdded(false)
        setLastEvent('Frame removed')
      })

      sdk.on('notificationsEnabled', ({ notificationDetails }) => {
        setNotificationDetails(notificationDetails ?? null)
        setLastEvent('Notifications enabled')
      })

      sdk.on('notificationsDisabled', () => {
        setNotificationDetails(null)
        setLastEvent('Notifications disabled')
      })

      sdk.on('primaryButtonClicked', () => {
        setLastEvent('Primary button clicked')
      })

      // Call ready action
      sdk.actions.ready({})
    }

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true)
      load()
      return () => {
        sdk.removeAllListeners()
      }
    }
  }, [isSDKLoaded])

  return {
    isSDKLoaded,
    context,
    added,
    notificationDetails,
    lastEvent,
    addFrame,
    addFrameResult,
    openUrl,
    close,
  }
}

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const frameContext = useFrame()

  return <FrameContext.Provider value={frameContext}>{children}</FrameContext.Provider>
}
