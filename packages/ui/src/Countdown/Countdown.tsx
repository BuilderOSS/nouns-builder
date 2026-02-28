import { useCountdown } from '@buildeross/hooks/useCountdown'
import { useIsMounted } from '@buildeross/hooks/useIsMounted'

interface CountdownProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  end: number
  onEnd?: () => void
}

export const Countdown: React.FC<CountdownProps> = ({ end, onEnd, ...props }) => {
  const isMounted = useIsMounted()
  const { countdownStringDays, isEnded } = useCountdown(Number(end), onEnd)

  if (!isMounted) return null

  return <span {...props}>{isEnded ? '00h 00m 00s' : countdownStringDays}</span>
}
