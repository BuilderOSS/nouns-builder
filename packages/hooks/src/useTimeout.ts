import { useEffect, useRef } from 'react'

type Callback = <T extends any[]>(...args: T) => void

//inspired by https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useTimeout(callback: Callback, delay: number | null) {
  const savedCallback = useRef<Callback | undefined>(undefined)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const handler: Callback = (...args) => savedCallback.current?.(...args)

    if (delay !== null) {
      let id = setTimeout(handler, delay)
      return () => clearTimeout(id)
    }
  }, [delay])
}
