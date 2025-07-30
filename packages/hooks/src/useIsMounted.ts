import React from 'react'

export function useIsMounted() {
  const [isMounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])
  return isMounted
}
