import React, { SVGProps } from 'react'

export const Skull: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      viewBox="0 0 136 192"
      width="136"
      height="192"
      fontFamily="monospace"
      fontSize="13"
      textAnchor="middle"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" stroke="currentColor">
        <path d="m8 48v56" />
        <path d="m24 136v8" />
        <path d="m112 136v8" />
        <path d="m128 48v56" />
        <path d="m24 16h88" />
        <path d="m32 176h72" />
        <path d="m24 160 8 16" />
        <path d="m36 136 4 8" />
        <path d="m112 16 16 32" />
        <path d="m8 48 16-32" />
        <path d="m96 144 8-16" />
        <path d="m104 176 8-16" />
        <path d="m36 88h16" />
        <path d="m84 88h16" />
        <path d="m20 136h20" />
        <path d="m96 136h20" />
      </g>
      <text x="72" y="36">
        \
      </text>
      <text x="16" y="68">
        ,
      </text>
      <text x="48" y="68">
        .-.
      </text>
      <text x="88" y="68">
        .-.
      </text>
      <text x="120" y="68">
        ,
      </text>
      <text x="28" y="84">
        )(
      </text>
      <text x="56" y="84">
        /
      </text>
      <text x="80" y="84">
        \
      </text>
      <text x="108" y="84">
        )(
      </text>
      <text x="16" y="100">
        /
      </text>
      <text x="68" y="100">
        /\
      </text>
      <text x="120" y="100">
        \
      </text>
      <text x="12" y="116">
        (_
      </text>
      <text x="68" y="116">
        ^^
      </text>
      <text x="124" y="116">
        _)
      </text>
      <text x="16" y="132">
        \
      </text>
      <text x="68" y="132">
        |IIIIII|
      </text>
      <text x="120" y="132">
        /
      </text>
      <text x="68" y="148">
        IIIIII
      </text>
    </svg>
  )
}
