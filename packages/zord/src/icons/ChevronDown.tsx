import * as React from 'react'
import { SVGProps } from 'react'

const SvgChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 16 16"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M1.043 5.707a1 1 0 0 1 1.414-1.414l5.536 5.535 5.536-5.535a1 1 0 1 1 1.414 1.414L8.689 11.96a.984.984 0 0 1-1.392 0L1.043 5.707Z" />
  </svg>
)

export default SvgChevronDown
